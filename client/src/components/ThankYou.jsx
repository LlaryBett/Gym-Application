import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ThankYou = () => {
    const location = useLocation();
    // Access the 'data' object passed via navigation state
    const responseData = location.state?.data;
    const member = responseData?.member;
    const nextSteps = responseData?.nextSteps;

    return (
        <div className="container mt-5 text-center">
            <div className="card shadow-sm p-5">
                <h1 className="text-success mb-4">Thank You!</h1>
                <p className="lead">Your registration has been submitted successfully.</p>
                
                {member && (
                    <div className="alert alert-info py-3 mb-4">
                        <h5 className="alert-heading">Registration Details</h5>
                        <hr />
                        <p className="mb-1"><strong>Name:</strong> {member.name}</p>
                        <p className="mb-0"><strong>Membership Number:</strong> {member.membershipNumber}</p>
                    </div>
                )}

                {nextSteps && nextSteps.length > 0 && (
                    <div className="text-start d-inline-block border p-4 rounded bg-light mb-4 w-100">
                        <h5 className="mb-3">What Happens Next?</h5>
                        <ul className="list-group list-group-flush bg-transparent">
                            {nextSteps.map((step, index) => (
                                <li key={index} className="list-group-item bg-transparent px-0 py-2">
                                    <span className="me-2 text-primary">•</span>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-4">
                    <Link to="/" className="btn btn-primary">Return to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default ThankYou;
