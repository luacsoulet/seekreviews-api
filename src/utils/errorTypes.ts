export const error400 = {
    description: 'Bad request',
    type: 'object',
    properties: {
        message: { type: 'string' }
    }
}

export const error401 = {
    description: 'Unauthorized',
    type: 'object',
    properties: {
        message: { type: 'string' }
    }
}

export const error403 = {
    description: 'Forbidden',
    type: 'object',
    properties: {
        message: { type: 'string' }
    }
}

export const error404 = {
    description: 'Not found',
    type: 'object',
    properties: {
        message: { type: 'string' }
    }
}

export const error500 = {
    description: 'Internal server error',
    type: 'object',
    properties: {
        message: { type: 'string' }
    }
}