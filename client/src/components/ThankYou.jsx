import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const ThankYou = () => {
    const location = useLocation();
    const responseData = location.state?.data;
    const member = responseData?.member;
    const nextSteps = responseData?.nextSteps;

    return (
        <div className="pt-20 min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 rounded-full p-4">
                        <FaCheckCircle className="text-green-600 text-5xl" />
                    </div>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-3">
                    Thank You!
                </h1>
                <p className="text-center text-gray-600 text-lg mb-8">
                    Your registration has been submitted successfully.
                </p>

                {/* Registration Details */}
                {member && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
                        <h5 className="font-bold text-gray-900 mb-4 text-lg">Registration Details</h5>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Name:</span>
                                <span className="text-gray-900 font-semibold">{member.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Membership Number:</span>
                                <span className="text-gray-900 font-semibold text-orange-600">{member.membershipNumber}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Next Steps */}
                {nextSteps && nextSteps.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                        <h5 className="font-bold text-gray-900 mb-6 text-lg">What Happens Next?</h5>
                        <ul className="space-y-4">
                            {nextSteps.map((step, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <span className="text-gray-700 pt-1">{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        to="/" 
                        className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                    >
                        Return to Home
                        <FaArrowRight size={16} />
                    </Link>
                    <Link 
                        to="/profile" 
                        className="inline-flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
                    >
                        View Profile
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ThankYou;
