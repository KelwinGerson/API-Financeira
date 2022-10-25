const express = require('express')
const {v4: uuidv4 } = require('uuid')
// uuid v4 utiliza números randomicos

const app = express()

const customers = [];

// middleware
app.use(express.json());

app.post('/account', (request, response) => {
    // desestruturação
    const { cpf, name } = request.body;

    // '.some' returns a boolean value
    const customerAlreadyExists = customers.some(
        // (===) checks whether its two operands are equal, returning a Boolean result 
        (customer) => customer.cpf === cpf
    );

    if (customerAlreadyExists) {
        return response.status(400).json({
            error: "Customer already exists!"
        })
    }


    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send({
        message: "Usuário criado com sucesso"
    })
    
});

// get cpf in route params 
app.get("/statement/:cpf", (request, response) => {
    const { cpf } = request.params;
    
    const customer = customers.find(customer => customer.cpf === cpf);

    return response.json(customer.statement) 
});

app.listen(1234, () => {
    console.log('Listening API...')
});