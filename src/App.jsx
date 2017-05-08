import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { withRouter } from 'react-router';
import Select from 'react-select';
import IssueAddNavItem from './IssueAddNavItem.jsx';
import withToast from './withToast.jsx';

const Header = (props) => {
function searchIssues(input) {
    if (input.length < 2) return Promise.resolve({ options: [] });
    return fetch(`/api/issues?search=${input}`).then(response => {
      if (!response.ok) return response.json().then(error => Promise.reject(error));
      return response.json().then(data => {
        const options = data.records.map(issue => ({
          value: issue._id,
          label: `${issue._id.substr(-4)}: ${issue.title}`,
        }));
        return { options };}).catch(error => {
        this.props.showError(`Error fetching data from server: ${error}`);
      });
    });
  }

function filterOptions(options) {
    return options;
  }
  function selectIssue(item) {
    if (item) props.router.push(`/issues/${item.value}`);
  }

return (
  <Navbar fluid>
    <Col sm={5}>
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
    </Col>
    <Col sm={4}>
        <div style={{ paddingTop: 8 }}>
          <Select.Async
            instanceId="search" placeholder="Search ..." autoload={false}
            cache={false}
            loadOptions={searchIssues} filterOptions={filterOptions}
            onChange={selectIssue}
          />
        </div>
      </Col>
    <Col sm={3}>
    <Nav pullRight>
      <IssueAddNavItem showError={props.showError} />
      <NavDropdown id="user-dropdown" title={<Glyphicon glyph="option-horizontal" />} noCaret>
        <MenuItem>Logout</MenuItem>
      </NavDropdown>
    </Nav>
    </Col>
  </Navbar>
);
}

Header.propTypes = {
  showError: React.PropTypes.func.isRequired,
};

const HeaderWithToast = withToast(Header);

const App = (props) => (
	<div>
		<HeaderWithToast />
	    <div className="container-fluid">
	      {props.children}
	    <hr/>
	    <h5><small>Full source code available at this <a href="https://github.com/koroleveduard/mern">GitHub repository</a>.</small></h5>
	    </div>
	</div>
)

App.propTypes = {
  children: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};

export default App;