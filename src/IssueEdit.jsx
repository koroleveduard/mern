import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router';
import { FormGroup, FormControl, ControlLabel, ButtonToolbar, Button,
  Panel, Form, Col, Alert } from 'react-bootstrap';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import withToast from './withToast.jsx';

class IssueEdit extends React.Component
{
	static dataFetcher({ params, urlBase }) {
	    return fetch(`${urlBase || ''}/api/issues/${params.id}`)
	    .then(response => {
	      if (!response.ok) return response.json().then(error => Promise.reject(error));
	      return response.json().then(data => ({ IssueEdit: data }));
	    });
  	}

	constructor(props, context){
		super(props, context);
	    let issue;
	    if (context.initialState.IssueEdit) {
	      issue = context.initialState.IssueEdit;
	      issue.created = new Date(issue.created);
	      issue.completionDate = issue.completionDate != null ?
	        new Date(issue.completionDate) : null;
	    } else {
	      issue = {
	        _id: '', title: '', status: '', owner: '', effort: null,
	        completionDate: null, created: null,
	      };
	    }
		this.state = {
			issue,
		    invalidFields: {},
		    showingValidation: false
		};
		this.onChange = this.onChange.bind(this);
		this.onValidityChange = this.onValidityChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.dismissValidation = this.dismissValidation.bind(this);
		this.showValidation = this.showValidation.bind(this);
	}

	onSubmit(event) {
		event.preventDefault();
		this.showValidation();
		if (Object.keys(this.state.invalidFields).length !== 0) {
			return;
		}

		IssueEdit.dataFetcher({ params: this.props.params })
    .then(data => {
      const issue = data.IssueEdit;
      issue.created = new Date(issue.created);
      issue.completionDate = issue.completionDate != null ?
        new Date(issue.completionDate) : null;
      	this.setState({ issue });
      	this.props.showSuccess('Задача успешно обновлена!');
		}).catch(err => {
			this.props.showError(`Соединение с сервером отсутствует: ${err.message}`);
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
				this.props.showError(`Не удалось получить данные: ${error.message}`);
			});
		}
		})
		.catch(err => {
			this.props.showError(`Не удалось получить данные с сервера: ${err.message}`);
		});
	}

	showValidation() {
    	this.setState({ showingValidation: true });
  	}

	dismissValidation() {
    	this.setState({ showingValidation: false });
  	}

	render() {
		const issue = this.state.issue;
		let validationMessage = null;
		if (Object.keys(this.state.invalidFields).length !== 0 && this.state.showingValidation) {
      		validationMessage = (
		        <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
		          Пожалуйста, заполните корретно все необходимые поля.
		        </Alert>);
    	}
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
          <FormGroup>
            <Col smOffset={3} sm={9}>{validationMessage}</Col>
          </FormGroup>
          <Link to="/issues">Вернуться назад</Link>
        </Form>
		</Panel>
		);
	}
}

IssueEdit.propTypes = {
	params: React.PropTypes.object.isRequired,
	showSuccess: React.PropTypes.func.isRequired,
  	showError: React.PropTypes.func.isRequired,
};

IssueEdit.contextTypes = {
  initialState: React.PropTypes.object,
};

const IssueEditWithToast = withToast(IssueEdit);
IssueEditWithToast.dataFetcher = IssueEdit.dataFetcher;

export default IssueEditWithToast;