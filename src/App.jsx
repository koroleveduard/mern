import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Redirect, hashHistory, browserHistory, withRouter} from 'react-router';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import IssueList from './IssueList.jsx';
import IssueEdit from './IssueEdit.jsx';

const contentNode = document.getElementById('contents');
const NoMatch = () =><p>Страница не найдена</p>;

const Header = () => (
  <Navbar fluid>
    <Navbar.Header>
      <Navbar.Brand>Issue Tracker</Navbar.Brand>
    </Navbar.Header>
    <Nav>
      <LinkContainer to="/issues">
        <NavItem>Задачи</NavItem>
      </LinkContainer>
      <LinkContainer to="/reports">
        <NavItem>Отчеты</NavItem>
      </LinkContainer>
    </Nav>
    <Nav pullRight>
      <NavItem><Glyphicon glyph="plus" /> Create Issue</NavItem>
      <NavDropdown id="user-dropdown" title={<Glyphicon glyph="option-horizontal" />} noCaret>
        <MenuItem>Logout</MenuItem>
      </NavDropdown>
    </Nav>
  </Navbar>
);

const App = (props) => (
	<div>
		<Header />
	    <div className="container-fluid">
	      {props.children}
	    <hr/>
	    <h5><small>Full source code available at this <a href="https://github.com/koroleveduard/mern">GitHub repository</a>.</small></h5>
	    </div>
	</div>
)

App.propTypes = {
  children: React.PropTypes.object.isRequired,
};

const RoutedApp = () => (
  <Router history={browserHistory} >
 	<Redirect from="/" to="/issues"/>
 	<Route path="/" component={App}>
 		<Route path="/issues" component={withRouter(IssueList)} />
    	<Route path="/issues/:id" component={IssueEdit} />
    	<Route path="*" component={NoMatch} />
 	</Route>
  </Router>
);

ReactDOM.render(<RoutedApp/>, contentNode);

if (module.hot) {
  module.hot.accept();
}