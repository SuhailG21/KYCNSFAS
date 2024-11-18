import React, { useState } from 'react';
import { createUserAndVerifyKYC } from './api';
import { ProgressBar } from 'react-step-progress-bar';
import 'react-step-progress-bar/styles.css';
import { fetchUserDetails } from './api';

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
    address_proof: '',
    ID_country: '',
    ID_type: '',
    ID_Number: '',
    ID_Image_front: '', 
    ID_Image_Back: '',
  });
  const [step, setStep] = useState(1); // Track the current step
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [livenessCheckUrl, setLivenessCheckUrl] = useState(null);
  const [isButtonClicked, setIsButtonClicked] = useState(false);


  // Handle liveness check URL and show iframe
const handleLivenessCheck = (url) => {
  setLivenessCheckUrl(url); // Set the URL to be displayed in the iframe
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
  const handleNext = () => {
    if (step === 1 && formData.firstname && formData.lastname && formData.dob) {
      setStep(step + 1); // Move to next step if all required fields are filled
    } else if (step === 2 && formData.address_line1 && formData.city && formData.country) {
      setStep(step + 1); // Check for step 2 completion
    } else if (step === 3 && formData.ID_country && formData.ID_type && formData.ID_Number) {
      setStep(step + 1); // Step 3
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  // Move to the previous step
  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Fetch user details
      const userDetails = await fetchUserDetails(formData.ID_Number);
  
      if (userDetails && userDetails.status === 'active') {
        // Redirect to Active.html if the status is active
        window.location.href = 'http://localhost:3000/Active.html';
        return;
      }
  
      // Proceed with KYC verification
      const kycResponse = await createUserAndVerifyKYC(formData);
      setResult(kycResponse);
  
      if (kycResponse.success) {
        window.location.href = "http://localhost:3000/Success.html";
      } else {
        window.location.href = "http://localhost:3000/Failure.html";
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to the Liveness Check URL
  const redirectToLivenessCheck = (url) => {
    window.open(url, '_blank');  // Open the URL in a new tab
  };

  return (
    <div className="form-container">
      <h1>Verify KYC</h1>
      <ProgressBar
        percent={(step - 1) * 33.33} // Calculate progress percentage
        filledBackground="linear-gradient(to right, #4caf50, #81c784)"
      />
      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="step-content active">
            <h2>Step 1: Personal Information</h2>
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
            <h2>Step 2: Address Information</h2>
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
            <div className="form-group">
              <label>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Proof of address</label>
              <input type="text" name="address_proof" value={formData.address_proof} onChange={handleChange} required />
            </div>
          </div>
        )}

        {/* Step 3: ID Information */}
        {step === 3 && (
          <div className="step-content active">
            <h2>Step 3: ID Information</h2>
            <div className="form-group">
              <label>ID Country</label>
              <input type="text" name="ID_country" value={formData.ID_country} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>ID Type</label>
              <input type="text" name="ID_type" value={formData.ID_type} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>ID Number</label>
              <input type="text" name="ID_Number" value={formData.ID_Number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>ID Image Front URL</label>
              <input type="text" name="ID_Image_front" value={formData.ID_Image_front} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>ID Image Back URL</label>
              <input type="text" name="ID_Image_Back" value={formData.ID_Image_Back} onChange={handleChange} required />
            </div>
          </div>
        )}

        {/* Step 4: Submit */}
{step === 4 && !(result && result.verify_status === 'Verified') && (
  <div className="step-content active">
    <h2>Step 4: Submit KYC</h2>
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Submitting...' : 'Submit KYC'}
    </button>
  </div>
)}

<div className="navigation-buttons">
  {/* Hide the "Back" button if the ID verification is successful */}
  {step > 1 && !(result && result.verify_status === 'Verified') && (
    <button type="button" onClick={handleBack}>Back</button>
  )}
  {step < 4 && (
    <button type="button" onClick={handleNext}>Next</button>
  )}
</div>
      </form>

      {/* Result display */}
      {result && (
        <div className="result">
          {result.success ? (
            <div className="success">
              
              
              {result.verify_status === 'Verified' && (
                <div className="liveness-check">
                  
                  {/* Button to trigger the liveness check iframe */}
                  {!isButtonClicked && (
<button onClick={() => handleLivenessCheck(result.url)}>
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
    allow="camera; microphone" // Allow access to camera and microphone
  ></iframe>
)}

                </div>
              )}
              {result.verify_status !== 'Verified' && (
                <p>Verification failed. Please try again.</p>
              )}
            </div>
          ) : (
            <div className="error">
              <h3>Verification Failed</h3>
              <p>{result.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KYCForm;

















