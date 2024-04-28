require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('content', request => JSON.stringify(request.body))

app.use(morgan((tokens, req, res) => {
    const format = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ]

    if (req.method === 'POST') format.push(tokens['content'](req, res))
    return format.join(' ')
}))


let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    },
    {
        "id": 5,
        "name": "zozo <3",
        "number": "214 blah blah blah"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>welcome to da home page</h1>')
})

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(
        `<p>phonebook has info for ${persons.length} people</p>
         <p>${date.toString()}</p>`)
})

app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(result => response.json(result))
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).send({ error: 'person not found' })
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id != id)

    response.status(204).end()
})

const generateId = () => {
    const rand = Math.random()
    const newId = Math.floor(rand * 10000)
    return newId
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name field empty'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number field empty'
        })
    }

    if (persons.map(person => person.name).includes(body.name)) {
        return response.status(400).json({
            error: 'name already in phonebook'
        })
    }

    const newPerson = new Person({
        name: body.name,
        number: body.number
    })

    newPerson.save()
        .then(result => {
            console.log(`${result.name} added to phonebook`)
            response.json(result)
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})