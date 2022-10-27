const { response } = require('express');
const express = require('express')
const {v4: uuidv4 } = require('uuid')
// uuid v4 utiliza números randomicos

const app = express()

const customers = [];

// Middleware
app.use(express.json());

// calc account movimentations 
function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0)

    return balance;
}

function verifyIfExistsAccountCPF (request, response, next) {
    const { cpf } = request.headers;
    //verify if count exist
    const customer = customers.find(customer => customer.cpf === cpf);

    if(!customer) {
        return response.status(400).json({error: "Customer not found!"})
    }
    // disponibilizando para outras funções consumirem
    request.customer = customer;
    // if everything is ok, the code will follow
    return next();
}

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
// always code below will be use this middleware
// app.use(verifyIfExistsAccountCPF);

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    return response.json(customer.statement) 
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount} = request.body;
    const { customer } = request;
    const statementOperation = {
        description,
        amount,
        create_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return response.status(201).send({
        message: "Deposit with sucess"
    })
    
});   

// withdraw
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) =>{
    const { amount} = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement)

    if( balance < amount) {
        return response.status(400).json({error: "Insuufficient funds"})
    }

    const statementOperation = {
        amount,
        create_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation)

    return response.status(201).send({
        movimentation: statementOperation,
        quantity: balance
    });
});

// balance account
app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;
    // create a date with time default
    const dateFormat = new Date(date + " 00:00");
    
    const statement = customer.statement.filter(
        (statement) => 
        statement.create_at.toDateString() === 
        new Date(dateFormat).toDateString()
    );
    return response.json(statement)
});


app.listen(1234, () => {
    console.log('Listening API...')
});