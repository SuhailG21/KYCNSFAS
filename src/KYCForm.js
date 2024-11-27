import React, { useState } from 'react';
import { createUserAndVerifyKYC } from './api';
import { checkUserStatus } from './api';
import { ProgressBar } from 'react-step-progress-bar';
import 'react-step-progress-bar/styles.css';

const KYCForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    dob: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    stateOrProvince: '',
    postalcode: '',
    country: '',
    address_proof: null,
    ID_country: '',
    ID_type: '',
    ID_Number: '',
    ID_Image_front: null, 
    ID_Image_Back: null,
    password: '', // New password field
  confirmPassword: '', // New confirmPassword field
  });
  const [step, setStep] = useState(1); // Track the current step
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [livenessCheckUrl, setLivenessCheckUrl] = useState(null);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [userStatus, setUserStatus] = useState(null);


  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;



  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };
  

  const handleFileChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.files[0],
    });
  };
  


  // Handle liveness check URL and show iframe
const handleLivenessCheck = (livenessurl1) => {
  setLivenessCheckUrl(livenessurl1); // Set the URL to be displayed in the iframe
  setIsButtonClicked(true); // Hide the button after click
};


  // Handle form data change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

// Move to the next step
const handleNext = async () => {
  try {
    if (step === 1 && formData.firstname && formData.lastname && formData.dob) {
      setStep(step + 1); // Move to next step if all required fields are filled
    } else if (step === 2 && formData.address_line1 && formData.city && formData.country) {
      setStep(step + 1); // Check for step 2 completion
    } else if (step === 3 && formData.ID_country && formData.ID_type && formData.ID_Number) {
      // Call checkUserStatus API at Step 3
      const userID = formData.ID_Number; // Assuming ID_Number is the user ID
      
      const status = await checkUserStatus(userID); // Call checkUserStatus API
      setUserStatus(status); // Save the status in state

      if (status.status === 'user already active') {
        setStep(5); // Skip to the final step if the user is already active
      } else if (status.status === 'user disabled') {
        setStep(5);
      }else if (status.status === 'user blocked') {
          setStep(step + 1);
      } else if (status.status === 'user not found') {
        setStep(5); // Proceed as normal to next step if user is not found
      } else {
        alert('Unexpected user status. Please try again.');
      }
    } else if (
      step === 4 &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      passwordRegex.test(formData.password) &&
      formData.password.length > 8
    ) {
      setStep(step + 1); // Step 4: password confirmation
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  } catch (error) {
    console.error('Error during step progression:', error);
    alert('An error occurred. Please try again.');
  }
};

// Move to the previous step
const handleBack = () => {
  // If the user is on step 5 and their status is either "user disabled" or "user already active", go back to step 3
  if (step === 5 && (userStatus?.status === 'user disabled' || userStatus?.status === 'user already active')) {
    setStep(3);  // Go back to step 3 if the user is either disabled or active
  } else {
    setStep(step - 1);  // Move back one step for other cases
  }
};



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await createUserAndVerifyKYC(formData);
      setResult(response);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      setResult({ success: false, message: 'Verification failed. Please ensure that all your details are correct and that your email and id number is unique.' });
    }
  };

  

  return (
    <div className="form-container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  Register
  <button
    onClick={toggleInstructions}
    style={{
      width: '30px',
      height: '30px',
      borderRadius: '50%', // Makes the button circular
      backgroundColor: 'orange', // Change to desired color
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      fontSize: '20px', // Adjust font size
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    ?
  </button>
</h1>

{showInstructions && (
    <div
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      width: '90%', // Adjust width for smaller screens
      maxWidth: '400px', // Limit maximum width
      height: 'auto',
      maxHeight: '80%', // Prevent overflow on smaller screens
      overflowY: 'auto', // Enable scrolling for overflowing content
    }}
    
    >
      <h3>How to Complete Registration</h3>
      <ul>
        <li>Fill in your personal information in Step 1.</li>
        <li>Provide your address details in Step 2.</li>
        <li>Upload your ID and necessary documents in Step 3.</li>
        <li>Submit your application and wait for verification.</li>
        <li>After verification completes, you will be required to do a face liveness session.</li>
        <li>Upon a successful face liveness session, you will receive a message with instructions on how to proceed.</li>
      </ul>
      <button
        onClick={toggleInstructions}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          backgroundColor: 'orange',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width:'20%'
        }}
      >
        Close
      </button>
    </div>
  )}
  {showInstructions && (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
      }}
      onClick={toggleInstructions} // Close modal when clicking outside
    ></div>
  )}

      <ProgressBar
        percent={(step - 1) * 33.33} // Calculate progress percentage
        filledBackground="linear-gradient(to right, #4caf50, #81c784)"
      />
      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="step-content active">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>
        )}

        {/* Step 2: Address Information */}
        {step === 2 && (
          <div className="step-content active">
            <h2>Address Information</h2>
            <div className="form-group">
              <label>Address Line 1</label>
              <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Address Line 2</label>
              <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>State or Province</label>
              <input type="text" name="stateOrProvince" value={formData.stateOrProvince} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Postal code</label>
              <input type="text" name="postalcode" value={formData.postalcode} onChange={handleChange} />
            </div>
            <div className="form-group1">
  <label>Country</label>
  <select
    name="country"
    value={formData.country}
    onChange={handleChange}
    required
  >
    <option value="">Select Country</option>
    <option value="USA">South Africa</option>
    {/* Add more country options here */}
  </select>
</div>


            <div className="form-group">
  <label>Proof of Address</label>
  <input 
    type="file" 
    name="address_proof" 
    onChange={(e) => handleFileChange(e, 'address_proof')} 
    required 
  />
</div>
          </div>
        )}

        {/* Step 3: ID Information */}
        {step === 3 && (
          <div className="step-content active">
            <h2>ID Information</h2>
            <div className="form-group1">
  <label>ID Country</label>
  <select
    name="ID_country"
    value={formData.ID_country}
    onChange={handleChange}
    required
  >
    <option value="">Select Country</option>
    <option value="USA">South Africa</option>
    {/* Add more country options here */}
  </select>
</div>
<div className="form-group1">
  <label>ID Type</label>
  <select
    name="ID_type"
    value={formData.ID_type}
    onChange={handleChange}
    required
  >
    <option value="">Select Type</option>
    <option value="USA">NationalId</option>
    {/* Add more country options here */}
  </select>
</div>
            <div className="form-group">
              <label>ID Number</label>
              <input type="text" name="ID_Number" value={formData.ID_Number} onChange={handleChange} required />
            </div>
            <div className="form-group">
  <label>ID Image Front</label>
  <input 
    type="file" 
    name="ID_Image_front" 
    onChange={(e) => handleFileChange(e, 'ID_Image_front')} 
    required 
  />
</div>
<div className="form-group">
  <label>ID Image Back</label>
  <input 
    type="file" 
    name="ID_Image_Back" 
    onChange={(e) => handleFileChange(e, 'ID_Image_Back')} 
    required 
  />
</div>
          </div>
        )}

         {/* Step 4: Password and Confirm Password */}
      {step === 4 && (
        <div className="step-content active">
          <h2>Set Password</h2>
          
          {/* Password Input */}
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input 
                type={passwordVisible ? 'text' : 'password'} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <span onClick={togglePasswordVisibility} className="password-toggle-icon">
              {passwordVisible ? (
                  <i className="fas fa-eye-slash"></i>
                ) : (
                  <i className="fas fa-eye"></i>
                )}
              </span>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input 
                type={confirmPasswordVisible ? 'text' : 'password'} 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
              <span onClick={toggleConfirmPasswordVisibility} className="password-toggle-icon">
                {confirmPasswordVisible ? (
                  <i className="fas fa-eye-slash"></i>
                ) : (
                  <i className="fas fa-eye"></i>
                )}
              </span>
            </div>
          </div>

          {/* Password Length Validation */}
{formData.password && formData.password.length < 9 && (
  <p style={{ color: 'red' }}>Password must be at least 9 characters long!</p>
)}

{/* Password Special Character Validation */}
{formData.password && !/(?=.*[@$!%*?&])/.test(formData.password) && (
  <p style={{ color: 'red' }}>Password must include at least one special character!</p>
)}

{/* Password Uppercase Letter Validation */}
{formData.password && !/(?=.*[A-Z])/.test(formData.password) && (
  <p style={{ color: 'red' }}>Password must include at least one uppercase letter!</p>
)}

{/* Password Number Validation */}
{formData.password && !/(?=.*\d)/.test(formData.password) && (
  <p style={{ color: 'red' }}>Password must include at least one number!</p>
)}

{/* Passwords Do Not Match Message */}
{formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
  <p style={{ color: 'red' }}>Passwords do not match!</p>
)}



          
        </div>
      )}


        {/* Step 5: Submit */}
{step === 5 && !(result?.KYCYes === 'true'|| result?.active === 'true'|| result?.verified === 'true' || result?.onboarded === 'no') && !result?.livenessUrl && (
  <div className="step-content active">
    <h2>Submit Application</h2>
    <button
  type="submit"
>
  {isSubmitting ? (
    <span className="spinner">
      <div className="loading-spinner"></div>
      Submitting...
    </span>
  ) : (
    "Submit KYC"
  )}
</button>

  </div>
)}

<div className="navigation-buttons">
  {step > 1 && !(result?.KYCYes === 'true'|| result?.active === 'true'|| result?.verified === 'true' || result?.onboarded === 'no') && !result?.livenessUrl && (
    <button type="button" onClick={handleBack}>Back</button>
  )}
  {step < 5 && (
    <button type="button" onClick={handleNext}>Next</button>
  )}
</div>

      </form>

     {/* Result display */}
     {result && (
        <div className="result">
          {result.KYCYes ? (
            <div className="success">
              {result.KYCYes === 'true' && (
                <div className="liveness-check">
                  {/* Button to trigger the liveness check iframe */}
                  {!isButtonClicked && (
                    <button onClick={() => handleLivenessCheck(result.livenessurl1)}>
                      Perform Liveness Check
                    </button>
                  )}
                  {/* Conditional rendering of iframe */}
                  {livenessCheckUrl && (
                    <iframe
                      src={livenessCheckUrl}
                      width="100%"
                      height="500px"
                      title="Liveness Check"
                      frameBorder="0"
                      allow="camera; microphone"
                    ></iframe>
                  )}
                </div>
              )}
              {result.KYCYes !== 'true' && (
                <p>Verification failed. Please ensure that your email and id number is unique</p>
                
              )}
            </div>
          ) : (
            <div className="error">
              
              <p>{result.message}</p>
            </div>
          )}
        </div>
      )}

       {/* Display result messages based on user status */}
{result && (
  <div className="result-box">
    {result.active === 'true' && (
      <div className="message active">
        <h2>🎉 User Already Active</h2>
        <p>The user is already active in the system. No further action is required.</p>
      </div>
    )}

    {result.verified === 'true' && (
      <div className="message verified">
        <h2>✅ User Already Verified</h2>
        <p>The user's KYC verification is complete. Everything is in order.</p>
        <p>Please allow between 24-48 hours for your account to become active.</p>
      </div>
    )}

{result.onboarded === 'no' && (
      <div className="message liveness-check">
        <h2>❔ User not onboarded</h2>
        <p>This user is not onboarded onto our system.</p>
        <p>Please wait for your identity to be onboarded, you will receive an SMS</p>
      </div>
    )}

    {result.livenessUrl && (
      <div className="message liveness-check">
        {!isButtonClicked && (
          <>
        <h2>🔍 Perform Liveness Check</h2>
        <p>The user is not yet verified. Please complete the liveness check below:</p>
        </>
      )}
        {!isButtonClicked ? (
          <button onClick={() => handleLivenessCheck(result.livenessUrl)}>
            Perform Liveness Check
          </button>
        ) : (
          livenessCheckUrl && (
            <iframe
              src={livenessCheckUrl}
              width="100%"
              height="500px"
              title="Liveness Check"
              frameBorder="0"
              allow="camera; microphone"
            ></iframe>
          )
        )}
      </div>
    )}

    
  </div>
)}






    </div>
  );
};

export default KYCForm;

















