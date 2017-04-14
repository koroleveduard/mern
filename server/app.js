import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import Issue from './issue.js';
import 'babel-polyfill';
import SourceMapSupport from 'source-map-support';
import path from 'path';
SourceMapSupport.install();

const app = express();
app.use(express.static(__dirname+'/../static'));
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const config = require('../webpack.config');
  config.entry.app.push('webpack-hot-middleware/client', 'webpack/hot/only-dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  const bundler = webpack(config);
  app.use(webpackDevMiddleware(bundler, { noInfo: true }));
  app.use(webpackHotMiddleware(bundler, { log: console.log }));
}

let db;
MongoClient.connect('mongodb://localhost/issuetracker')
.then(connection => {
  db = connection;
  app.listen(3000, () => {
    console.log('App started on port 3000');
  });
})
.catch(error => {
  console.log('ERROR:', error);
});

app.get('/api/issues',(req,res) => {
	  const filter = {};
	  if (req.query.status) {
	  	filter.status = req.query.status;
	  }

    if (req.query.effort_lte || req.query.effort_gte) {
      filter.effort = {};
    }

    if (req.query.effort_lte) {
      filter.effort.$lte = parseInt(req.query.effort_lte, 10);
    }

    if (req.query.effort_gte) {
      filter.effort.$gte = parseInt(req.query.effort_gte, 10);
    }
    
	  db.collection('issues').find(filter).toArray()
	  .then(issues => {
	    const metadata = {total_count:issues.length};
	    res.json({_metadata: metadata, records: issues});
	  })
	  .catch(error => {
	    console.log(error);
	    res.status(500).json({ message: `Internal Server Error: ${error}` });
	  });
});

app.post('/api/issues',(req,res) => {
	const newIssue = req.body;
	newIssue.created = new Date();
	if (!newIssue.status)
    	newIssue.status = 'New';

    const err = Issue.validateIssue(newIssue)
    if (err) {
    	res.status(422).json({ message: `Invalid requrest: ${err}` });
    	return;
	}

  db.collection('issues').insertOne(newIssue).then(result =>
    db.collection('issues').find({ _id: result.insertedId }).limit(1).next()
  ).then(newIssue => {
    res.json(newIssue);
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.get('*',(req,res) => {
  res.sendFile(path.resolve('static/index.html'));
});