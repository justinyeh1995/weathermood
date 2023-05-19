import axios from 'axios';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import '@babel/polyfill';

const todoBaseUrl = 'http://localhost:3000/todo_api';

export function listTodos(unaccomplishedOnly = false, searchText = '', start) {
    let url = `${todoBaseUrl}/todos`
    let query = []
    if (unaccomplishedOnly) {
        query.push(`unaccomplishedOnly=${unaccomplishedOnly}`)
    }
    if (searchText) {
        query.push(`searchText=${searchText}`)
    }
    if (start) {
        query.push(`start=${start}`)
    }
    if (query.length) {
        url += '?' + query.join('&')
    }
    console.log(`Making GET request to: ${url}`);

    return axios.get(url).then(function(res) {
        if (res.status !== 200)
            throw new Error(`Unexpected response code: ${res.status}`);

        return res.data;
    });
}

// Simulated server-side code
function _listTodos(unaccomplishedOnly = false, searchText = '') {
    let todoString = localStorage.getItem(todoKey);
    let todos = todoString ? JSON.parse(todoString) : [];

    if (unaccomplishedOnly) {
        todos = todos.filter(t => {
            return !t.doneTs;
        });
    }
    if (searchText) {
        todos = todos.filter(t => {
            return t.text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        });
    }
    return todos;
};

export function createTodo(mood, text) {
    let url = `${todoBaseUrl}/todos`

    console.log(`Making POST request to: ${url}`);

    return axios.post(url, {
        mood,
        text
    }).then(function(res) {
        if (res.status !== 200)
            throw new Error(`Unexpected response code: ${res.status}`);

        return res.data;
    });
}

// Simulated server-side code
function _createTodo(mood, text) {
    const newTodo = {
        id: uuid(),
        mood: mood,
        text: text,
        ts: moment().unix(),
        doneTs: null
    };
    const todos = [
        newTodo,
        ..._listTodos()
    ];
    localStorage.setItem(todoKey, JSON.stringify(todos));

    return newTodo;
}

export function accomplishTodo(id) {
    let url = `${todoBaseUrl}/todos/${id}`;

    console.log(`Making POST request to: ${url}`);

    return axios.post(url).then(function(res) {
        if (res.status !== 200)
            throw new Error(`Unexpected response code: ${res.status}`);

        return res.data;
    });
}

// Simulated server-side code
function _accomplishTodo(id) {
    let todos = _listTodos();
    for(let t of todos) {
        if(t.id === id) {
            t.doneTs = moment().unix();
            break;
        }
    }
    localStorage.setItem(todoKey, JSON.stringify(todos));
}
