const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const supabase = require('../supabase');
const authMiddleware = require('../middleware/auth');

// GET all tasks for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('owner', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(tasks);
  } catch (error) {
    console.log('Get tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE a task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        description: description || '',
        status: status || 'todo',
        priority: priority || 'medium',
        due_date: dueDate || null,
        owner: req.userId
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(task);
  } catch (error) {
    console.log('Create task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE a task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.due_date = dueDate;

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', req.params.id)
      .eq('owner', req.userId)
      .select()
      .single();

    if (error) throw error;
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (error) {
    console.log('Update task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('owner', req.userId);

    if (error) throw error;
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.log('Delete task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GENERATE share link
router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const token = uuidv4();

    const { data: task, error } = await supabase
      .from('tasks')
      .update({ share_token: token })
      .eq('id', req.params.id)
      .eq('owner', req.userId)
      .select()
      .single();

    if (error) throw error;
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ token });
  } catch (error) {
    console.log('Share error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// VIEW shared task (public - no auth needed)
router.get('/shared/:token', async (req, res) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('share_token', req.params.token)
      .maybeSingle();

    if (error || !task) return res.status(404).json({ message: 'Shared task not found' });
    res.json(task);
  } catch (error) {
    console.log('Shared task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
