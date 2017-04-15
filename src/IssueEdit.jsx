import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router';
import { FormGroup, FormControl, ControlLabel, ButtonToolbar, Button,
  Panel, Form, Col } from 'react-bootstrap';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';

export default class IssueEdit extends React.Component
{
	constructor(){
		super();
		this.state = {
			issue: {
		    	_id: '', 
		    	title: '', 
		    	status: '', 
		    	owner: '', 
		    	effort: '',
		        completionDate: null, 
		        created: null,
		    },
		    invalidFields: {},
		};
		this.onChange = this.onChange.bind(this);
		this.onValidityChange = this.onValidityChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}

	onSubmit(event) {
		event.preventDefault();
		if (Object.keys(this.state.invalidFields).length !== 0) {
			return;
		}

		fetch(`/api/issues/${this.props.params.id}`, 
		{
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(this.state.issue),
		})
		.then(response => {
			if (response.ok) {
				response.json().then(updatedIssue => {
					updatedIssue.created = new Date(updatedIssue.created);
					if (updatedIssue.completionDate) {
						updatedIssue.completionDate = new Date(updatedIssue.completionDate);
					}

					this.setState({ issue: updatedIssue });
					alert('Updated issue successfully.');
				});
			} else {
				response.json()
				.then(error => {
					alert(`Failed to update issue: ${error.message}`);
				});
			}
		})
		.catch(err => {
			alert(`Error in sending data to server: ${err.message}`);
		});
	}

	onValidityChange(event, valid) {
		const invalidFields = Object.assign({}, this.state.invalidFields);

		if (!valid) {
			invalidFields[event.target.name] = true;
		} else {
			delete invalidFields[event.target.name];
		}

		this.setState({ invalidFields });
	}

	componentDidMount(){
		this.loadData();
	}

	componentDidUpdate(prevProps){
		if (prevProps.params.id !== this.props.params.id) {
	      this.loadData();
	    }
	}

	onChange(event, convertedValue) {
	    const issue = Object.assign({}, this.state.issue);
	   	const value = (convertedValue !== undefined) ? convertedValue : event.target.value;
	   	issue[event.target.name] = value;
	    this.setState({ issue });
  	}

  	loadData() {
		fetch(`/api/issues/${this.props.params.id}`)
		.then(response => {
			if (response.ok) {
				response.json().then(issue => {
					issue.created = new Date(issue.created);
					issue.completionDate = issue.completionDate != null ?
					new Date(issue.completionDate) : null;
					issue.effort = issue.effort != null ? issue.effort.toString() : '';
					this.setState({ issue });
				});
			} else {
				response.json().then(error => {
				alert(`Failed to fetch issue: ${error.message}`);
			});
		}
		})
		.catch(err => {
			alert(`Error in fetching data from server: ${err.message}`);
		});
	}

	render() {
		const issue = this.state.issue;
		const validationMessage = Object.keys(this.state.invalidFields).length === 0 ? null : (<div className="error">Пожалуйста, заполняйте все обязательные поля корректно</div>);
		return (
			<Panel header="Редактировать задачу">
				<Form horizontal onSubmit={this.onSubmit}>
					<FormGroup>
			        	<Col componentClass={ControlLabel} sm={3}>ID</Col>
			            <Col sm={9}>
			        		<FormControl.Static>{issue._id}</FormControl.Static>
			            </Col>
			        </FormGroup>
					<FormGroup>
			        	<Col componentClass={ControlLabel} sm={3}>Создана</Col>
			            <Col sm={9}>
			        	<FormControl.Static>
			            	{issue.created ? issue.created.toDateString() : ''}
			            </FormControl.Static>
			            </Col>
			        </FormGroup>
					<FormGroup>
			            <Col componentClass={ControlLabel} sm={3}>Статус</Col>
			            <Col sm={9}>
			            	<FormControl
			                componentClass="select" name="status" value={issue.status}
			                onChange={this.onChange}
			              >
			                <option value="New">Новая</option>
			                <option value="Open">Открытая</option>
			                <option value="Assigned">Назначена</option>
			                <option value="Fixed">Решена</option>
			                <option value="Verified">Проверена</option>
			                <option value="Closed">Закрыта</option>
			        		</FormControl>
			        	</Col>
			        </FormGroup>
					<FormGroup>
						<Col componentClass={ControlLabel} sm={3}>Автор</Col>
						<Col sm={9}>
							<FormControl name="owner" value={issue.owner} onChange={this.onChange} />
						</Col>
					</FormGroup>
					<FormGroup>
						<Col componentClass={ControlLabel} sm={3}>Попытка</Col>
						<Col sm={9}>
							<FormControl
							componentClass={NumInput} name="effort"
							value={parseInt(issue.effort)} onChange={this.onChange} />
						</Col>
					</FormGroup>
					<FormGroup 
						validationState={this.state.invalidFields.completionDate ? 'error' : null}>
						<Col componentClass={ControlLabel} sm={3}>Дата завершения</Col>
						<Col sm={9}>
						<FormControl
						componentClass={DateInput} name="completionDate"
						value={issue.completionDate} onChange={this.onChange}
						onValidityChange={this.onValidityChange}
						/>
						<FormControl.Feedback />
						</Col>
					</FormGroup>
					<FormGroup>
						<Col componentClass={ControlLabel} sm={3}>Название</Col>
						<Col sm={9}>
						<FormControl name="title" value={issue.title} onChange={this.onChange} />
						</Col>
					</FormGroup>
          <FormGroup>
            <Col smOffset={3} sm={6}>
              <ButtonToolbar>
                <Button bsStyle="primary" type="submit">Обновить</Button>
              </ButtonToolbar>
            </Col>
          </FormGroup>
          <Link to="/issues">Вернуться назад</Link>
        </Form>
        {validationMessage}
			</Panel>
		);
	}
}

IssueEdit.propTypes = {
	params: React.PropTypes.object.isRequired,
};