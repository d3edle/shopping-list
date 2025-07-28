require('dotenv').config()
const Item = require('./models/item')

const express = require('express')
const app = express()
// var morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
// app.use(morgan('tiny'))
app.use(express.static('dist'))

app.get('/', (request, response, next) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  const date = new Date()
  Item.countDocuments({}).then(count => {
    response.send(`
  <div>Phonebook has info for ${count} items</div>
  <div>${date}</div>
  `)
  })
})

app.get('/api/items', (request, response) => {
  Item.find({}).then((items) => {
    response.json(items)
  })
})

app.get('/api/items/:id', (request, response, next) => {
  Item.findById(request.params.id)
    .then(Item => {
      if(Item){
        response.json(Item)
      }else{
        console.log('nonexistent')
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


app.delete('/api/items/:id', (request, response, next) => {
  Item.findByIdAndDelete(request.params.id)
    .then(result => {
      response.json(result)
      response.status(204).end()
    })
    .catch(error => next(error))

})


app.post('/api/items', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ error: 'Minimum length of 1 character required' })
  }

  const item = new Item({
    name: body.name,
    store: body.store,
    quantity: Number(body.quantity)
  })

  item.save()
    .then((savedItem) => {
      response.json(savedItem)
    })
    .catch(error => next(error))
})

app.put('/api/items/:id', (request, response, next) => {
  const body = request.body

  Item.findById(request.params.id)
    .then(item => {
      if(!item) {
        response.status(404).end()
      }
      
      item.quantity = body.quantity
      item.name = body.name
      item.store = body.store

      return item.save().then(updatedItem => {
        response.json(updatedItem)
      })
        .catch(error => next(error))

    })
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})