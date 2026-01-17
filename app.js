const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));


let tasks = [];

app.get("/api/tasks",(req,res) => {
    res.json(tasks);
});

app.post("/api/tasks", (req, res) =>{
    const title= req.body.title;
    const description = req.body.description;

    if(!title)
    {return res.send("TItle is required");}

    const newTask = {
        id: Date.now(),
        title: title,
        description: description,
        completed: false
    };

    tasks.push(newTask);
    res.json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
    const id= Number(req.params.id);

    for(let i=0; i<tasks.length; i++)
    {
        if(tasks[i].id === id) {
            tasks[i].completed= req.body.completed
            return res.json(tasks[i]);
        }
    }
    res.send("Task Not Found");
});

app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    tasks = tasks.filter(task => task.id !== id);
    res.send("Task deleted");
});

app.listen(port, () => {
        console.log("server is is running on 3000")
    });
