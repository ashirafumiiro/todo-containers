const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const redis = require('../redis')

const count = 0;

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  await redis.setAsync('counter', parseInt(await redis.getAsync('counter') || 0)+1)
  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.json(req.todo); // Implement this
});

/* PUT todo. */ 
singleRouter.put('/', async (req, res) => {
  const todo = req.body
  Todo.findByIdAndUpdate(req.todo._id, todo, { new: true })
    .then(updatedTodo => {
      res.json(updatedTodo)
    })
    .catch(error => res.status(500).json({error: error.message}).end())
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
