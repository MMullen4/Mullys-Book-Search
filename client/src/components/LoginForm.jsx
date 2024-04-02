// see SignupForm.js for comments
import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../utils/mutations';

// import { loginUser } from '../utils/API';
import Auth from '../utils/auth';

const LoginForm = () => {
  const [login, { error, data }] = useMutation(LOGIN_USER);
  // set initial form state for the login form
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });

  const [validated] = useState(false); // set state for form validation
  const [showAlert, setShowAlert] = useState(false); // set state for alert

  const handleInputChange = (event) => { // update state based on form input changes
    const { name, value } = event.target;
    setUserFormData({
      ...userFormData,
      [name]: value
    });
    console.log(userFormData);
  };

  const handleFormSubmit = async (event) => { // submit form
    event.preventDefault(); // prevent page refresh
    console.log(userFormData);

    // check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    try { // use the loginUser mutation to log in the user.
      const { data } = await login({
        variables: { ...userFormData }
      });
      Auth.login(data.login.token);
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    // const response = await loginUser(userFormData);
    // if (!response.ok) {
    //   throw new Error('something went wrong!');
    // }

  //   const { token, user } = await response.json();
  //   console.log(user);
  //   Auth.login(token);
  // } catch (err) {
  //   console.error(err);
  //   setShowAlert(true);
  // }

  setUserFormData({ // clear form values
    // username: '',
    email: '',
    password: '',
  });
};

return (
  <>
    <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
      <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
        Something went wrong with your login credentials!
      </Alert>
      <Form.Group className='mb-3'>
        <Form.Label htmlFor='email'>Email</Form.Label>
        <Form.Control
          type='text'
          placeholder='Your email'
          name='email'
          onChange={handleInputChange}
          value={userFormData.email}
          required
        />
        <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label htmlFor='password'>Password</Form.Label>
        <Form.Control
          type='password'
          placeholder='Your password'
          name='password'
          onChange={handleInputChange}
          value={userFormData.password}
          required
        />
        <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
      </Form.Group>
      <Button
        disabled={!(userFormData.email && userFormData.password)}
        type='submit'
        variant='success'>
        Submit
      </Button>
    </Form>
  </>
);
};

export default LoginForm;
