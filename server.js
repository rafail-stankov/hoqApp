/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/build/views');

// This serves static files from the specified directory
app.use(express.static(__dirname + '/build'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// landing page
app.get(['/home', '/home.jade'], (req, res) => {
  res.render('home');
});

// projects
app.get(['/projects', '/projects.jade'], (req, res) => {
  res.render('projects');
});

// categories
app.get(['/categories', '/categories.jade'], (req, res) => {
  if(req.query.projectId){
    res.render('categories', {projectId: req.query.projectId});
  }
  res.send("error");
  // TODO: fix error message
});

// categories
app.get(['/hoq', '/hoq.jade'], (req, res) => {
  if(req.query.categoryId){
    res.render('HoQ', {categoryId: req.query.categoryId});
  }
  res.send("error");
  // TODO: fix error message
});

// HoQ
// app.get(['/hoq', '/HoQ.jade'], (req, res) => {
//   console.log(req.query.id);
//   res.render('HoQ', {hoqId: req.query.id});
// });

app.get('/api/getAll', (req, res) => {
  let options = {
    root: __dirname + '/server-data/'
  };

  const fileName = 'events.json';
  res.sendFile(fileName, options, (err) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
  });
});

app.post('/api/add', (req, res) => {
  let jsonFile = __dirname + '/server-data/events.json';
  let newEvent = req.body;
  console.log('Adding new event:', newEvent);
  fs.readFile(jsonFile, (err, data) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    let events = JSON.parse(data);
    events.push(newEvent);
    let eventsJson = JSON.stringify(events, null, 2);
    fs.writeFile(jsonFile, eventsJson, err => {
      if (err) {
        res.sendStatus(500);
        return;
      }
      // You could also respond with the database json to save a round trip
      res.sendStatus(200);
    });
  });
});

//
app.post('/api/delete', (req, res) => {
  let jsonFile = __dirname + '/server-data/events.json';
  let id = req.body.id;
  fs.readFile(jsonFile, (err, data) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    let events = JSON.parse(data);
    let index = events.findIndex(event => event.id == id);
    events.splice(index, 1);

    let eventsJson = JSON.stringify(events, null, 2);

    fs.writeFile(jsonFile, eventsJson, err => {
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });
});

const server = app.listen(8081, () => {

  const host = server.address().address;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
