const express = require('express')

const app = express()

// cpf - String
// name - String
// id - uuid
// statement - []

app.post('/account', (request, response) => {
    // desestruturação
    const {cpf, name} = request.body;
    
    
})

app.listen(1234);