import React, { useEffect, useState } from 'react';
import "./Header.css";
import Logo from "../../assets/logo.svg";
import { Modal, Box, Tabs, Tab, Button } from '@mui/material';
import styled from '@emotion/styled';
import { useHistory } from 'react-router-dom';
import { FormControl, FormHelperText, Input, InputLabel } from '@material-ui/core';

const StyledTabs = styled(Tabs)({
    borderBottom: '1px solid #e8e8e8',
    '& .MuiTabs-indicator': {
        backgroundColor: '#ff7f7f'
    }
  });

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
    () => ({
      '&.Mui-selected': {
        color: '#000',
      },
      '&.MuiTab-root': {
        width: '50%',
      }
    }),
  );

const Header = function(props){

    // indicates header in details page
    let showBookBotton = props.showBook === true;

    // end points
    let baseUrl = 'http://localhost:8085/api/v1';
    let registerEndPoint = '/signup';
    let loginEndPoint = '/auth/login';
    let logoutEndPoint = '/auth/logout';

    // initialize state
    let [authToken, setAuthToken] = useState(undefined);
    const [isModalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [loginForm, setLoginForm] = useState({username: '', password: '', successMessage: undefined});
    const [registerForm, setRegisterForm] = useState({firstName: '', lastName: '', email: '', password: '', phone: '', successMessage: undefined});
    const [loginErrorMessages, setLoginErrorMessages] = useState({username: {display: 'none'}, password: {display: 'none'}});
    const [registerErrorMessages, setRegisterErrorMessages] = useState({firstName: {display: 'none'}, lastName: {display: 'none'}, email: {display: 'none'}, password: {display: 'none'}, phone: {display: 'none'}});

    let loginButton, bookButton;
    let type = ( authToken === '' || authToken === null || authToken === undefined || authToken === 'undefined')? 'login': 'logout';
    let {movieId} = props;

    const history = useHistory();

    const loginModalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    // load auth token from session storage
    useEffect(() => {
        let token = sessionStorage.getItem('token-bookmymovie');
        if(token !== '' && token !== undefined && token !== 'undefined'){
            setAuthToken(token);
        }
    }, []);

    const showLogin = async () => {
        setModalOpen(true);
    }

    const showLogout = async () => {
        try{
            let rawResponse = await fetch(baseUrl+logoutEndPoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if(rawResponse.ok){
                setAuthToken();
                sessionStorage.setItem('token-bookmymovie', undefined);
            }
        } catch (e){
            console.info(e);
        }
    }

    const onbookShow = () => {
        if(type === 'login'){
            showLogin();
        } else {
            history.push(`/bookshow/${movieId}`);
        }
    }

    // reset forms and error messages when modal is closed
    const handleModalClose = () => {
        setModalOpen(false);
        setLoginForm({username: '', password: ''});
        setRegisterForm({firstName: '', lastName: '', email: '', password: '', phone: '', successMessage: undefined});
        setLoginErrorMessages({username: {display: 'none'}, password: {display: 'none'}});
        setRegisterErrorMessages({firstName: {display: 'none'}, lastName: {display: 'none'}, email: {display: 'none'}, password: {display: 'none'}, phone: {display: 'none'}});
    }

    // activate tabs when corresponding buttons are clicked
    const handleTabSwitch = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleUsernameChange = (event) => {
        let username = event.target.value;
        setLoginForm({...loginForm, username });
        initLoginErrorMessages();
    }

    const handlePasswordChange = (event) => {
        let password = event.target.value;
        setLoginForm({...loginForm, password });
        initLoginErrorMessages();
    }

    const onLogin = async (e) => {
        e.preventDefault();
        try{
            // encode access key
            let accesskey = window.btoa(`${loginForm.username}:${loginForm.password}`);

            // invoke login api
            let rawResponse = await fetch(baseUrl+loginEndPoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${accesskey}`
                }
            });

            // parse response and get token
            let successMessage;
            if(rawResponse.ok){
                let token = rawResponse.headers.get('access-token');
                sessionStorage.setItem('token-bookmymovie', token);
                setAuthToken(token);
                handleModalClose();
            } else {
                successMessage = 'Error occured. Unable to Login!';
                setLoginForm({
                    ...loginForm,
                    successMessage
                });
            }
        } catch (e){
            console.info(e);
        }
    }

    const handleRegisterFormChange = (event) => {
        let formField = event.target.name;
        let fieldValue = event.target.value;
        let newForm = {...registerForm};
        newForm[formField] = fieldValue;
        setRegisterForm(newForm);
        initRegisterErrorMessages();
    }

    // register new user
    const onRegister = async (e) => {
        e.preventDefault();
        try{
            let data = {
                email_address: registerForm.email,
                first_name: registerForm.firstName,
                last_name: registerForm.lastName,
                mobile_number: registerForm.phone,
                password: registerForm.password
            }

            const headers = new Headers();
            headers.append('Content-Type', 'application/json');

            let rawResponse = await fetch(baseUrl+registerEndPoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            let successMessage;
            let jsonResp = await rawResponse.json();
            if(rawResponse.ok){
                successMessage = jsonResp.status === 'ACTIVE'? 'Registration Successful. Please login!': 'Error occurred';
            } else {
                successMessage = jsonResp.message;
            }

            setRegisterForm({
                ...registerForm,
                successMessage
            });
        } catch (e){
            console.info(e);
        }
    }

    const initLoginErrorMessages = () => {
        let {username, password} = loginErrorMessages;
        if(loginForm.username.trim() === '' || loginForm.username === undefined){ // empty username
            username = {display: 'block'};
        } else {
            username = {display: 'none'};
        }
        if(loginForm.password.trim() === '' || loginForm.password === undefined){ // empty password
            password = {display: 'block'};
        } else {
            password = {display: 'none'};
        }
        setLoginErrorMessages({username, password});
    }

    const initRegisterErrorMessages = () => {
        let {firstName, lastName, email, password, phone} = registerErrorMessages;
        if(registerForm.firstName.trim() === '' || registerForm.firstName === undefined){ // empty first name
            firstName = {display: 'block'};
        } else {
            firstName = {display: 'none'};
        }

        if(registerForm.lastName.trim() === '' || registerForm.lastName === undefined){ // empty last name
            lastName = {display: 'block'};
        } else {
            lastName = {display: 'none'};
        }

        if(registerForm.email.trim() === '' || registerForm.email === undefined){ // empty email
            email = {display: 'block'};
        } else {
            email = {display: 'none'};
        }

        if(registerForm.password.trim() === '' || registerForm.password === undefined){ // empty password
            password = {display: 'block'};
        } else {
            password = {display: 'none'};
        }

        if(registerForm.phone.trim() === '' || registerForm.phone === undefined){ // phone number
            phone = {display: 'block'};
        } else {
            phone = {display: 'none'};
        }
        setRegisterErrorMessages({firstName, lastName, email, password, phone});
    }

    // show login/logout button based on authentication token
    if(type === 'logout'){
        loginButton = <Button variant="contained" color="default" onClick={showLogout}>Logout</Button>
    } else {
        loginButton = <Button variant="contained" color="default" onClick={showLogin}>Login</Button>
    }

    // redirect to login for guest user, book movie for logged in user
    if(showBookBotton){
        bookButton = <Button variant="contained" color="primary"  onClick={onbookShow}>Book Show</Button>
    }

    return (
        <header>
            <div className='left'>
                <img src={Logo} alt="Logo" className='spin' />
            </div>
            <div className='right'>
                {bookButton}
                {loginButton}
            </div>

            {/* Modal window */}
            <Modal
                open={isModalOpen}
                onClose={handleModalClose}
                aria-labelledby="login-modal"
                aria-describedby="login to application">
                <Box sx={{ width: '100%', ...loginModalStyle }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {/* Tabs - Login/Register */}
                        <StyledTabs value={activeTab} onChange={handleTabSwitch} aria-label="login/register">
                            <StyledTab label="Login" aria-labelledby="simple-tabpanel-login" aria-describedby="login existing user" />
                            <StyledTab label="Register" aria-labelledby="simple-tabpanel-register" aria-describedby="register new user" />
                        </StyledTabs>
                    </Box>

                    {/* Login Tab content */}
                    <div
                        role="tabpanel"
                        hidden={activeTab !== 0}
                        id="simple-tabpanel-login"
                        aria-labelledby="simple-tab-login">
                        <div className='login-container'>
                            <form className="login-form" onSubmit={onLogin}>
                                <FormControl>
                                    <InputLabel htmlFor="username">Username *</InputLabel>
                                    <Input id="username" name="username" type="text" value={loginForm.username} required={true}  onChange={handleUsernameChange} />
                                    <FormHelperText style={loginErrorMessages.username}>
                                        <span className="red">Required</span>
                                    </FormHelperText>
                                </FormControl>
                                <FormControl>
                                    <InputLabel htmlFor="password">Password *</InputLabel>
                                    <Input id="password" name="password" type="password" value={loginForm.password} required={true}  onChange={handlePasswordChange} />
                                    <FormHelperText style={loginErrorMessages.password}>
                                        <span className="red">Required</span>
                                    </FormHelperText>
                                </FormControl>
                                <div className='error-message'>{loginForm.successMessage}</div>
                                <div className="login-button">
                                    <Button type="submit" variant="contained" onClick={initLoginErrorMessages}>Login</Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Register Tab content */}
                    <div
                        role="tabpanel"
                        hidden={activeTab !== 1}
                        id="simple-tabpanel-register"
                        aria-labelledby="simple-tab-register">
                        <form className="register-form" onSubmit={onRegister}>
                            <div className='register-container'>
                                <FormControl>
                                    <InputLabel htmlFor="firstName">First Name *</InputLabel>
                                    <Input id="firstName" name="firstName" type="text" value={registerForm.firstName} required={true}  onChange={handleRegisterFormChange} />
                                    <FormHelperText style={registerErrorMessages.firstName}>
                                        <span className="red">Required</span>
                                    </FormHelperText>
                                </FormControl>
                                <FormControl>
                                    <InputLabel htmlFor="lastName">Last Name *</InputLabel>
                                    <Input id="lastName" name="lastName" type="text" value={registerForm.lastName} required={true}  onChange={handleRegisterFormChange} />
                                    <FormHelperText style={registerErrorMessages.lastName}>
                                        <span className="red">Required</span>
                                    </FormHelperText>
                                </FormControl>
                                <FormControl>
                                    <InputLabel htmlFor="email">Email *</InputLabel>
                                    <Input id="email" name="email" type="email" value={registerForm.email} required={true}  onChange={handleRegisterFormChange} />
                                    <FormHelperText style={registerErrorMessages.email}>
                                        <span className="red">Required</span>
                                    </FormHelperText>
                                </FormControl>
                                <FormControl>
                                    <InputLabel htmlFor="newPassword">Password *</InputLabel>
                                    <Input id="newPassword" name="password" type="password" value={registerForm.password} required={true}  onChange={handleRegisterFormChange} />
                                    <FormHelperText style={registerErrorMessages.password}>
                                        <span className="red">Required</span>
                                    </FormHelperText>
                                </FormControl>
                                <FormControl>
                                    <InputLabel htmlFor="phone">Contact No *</InputLabel>
                                    <Input id="phone" name="phone" type="tel" value={registerForm.phone} required={true}  onChange={handleRegisterFormChange} pattern="[\d]{10}" />
                                    <FormHelperText style={registerErrorMessages.phone}>
                                        <span className="red">Required</span>
                                    </FormHelperText>
                                </FormControl>
                            </div>
                            {registerForm.successMessage}
                            <div className="register-button">
                                <Button type="submit" variant="contained" onClick={initRegisterErrorMessages}>Register</Button>
                            </div>
                        </form>
                    </div>
                </Box>
            </Modal>
        </header>
    );
};

export default Header;
