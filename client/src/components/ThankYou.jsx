import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaDownload, FaArrowRight, FaFire, FaCopy, FaCheck } from 'react-icons/fa';
import { GiStrongMan } from 'react-icons/gi';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const ThankYou = () => {
    const location = useLocation();
    const responseData = location.state?.data;
    const member = responseData?.member;
    const nextSteps = responseData?.nextSteps;
    
    const [copied, setCopied] = useState(false);

    const handleCopyMembership = async () => {
        try {
            await navigator.clipboard.writeText(member.membershipNumber);
            setCopied(true);
            toast.success('Membership number copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

   const handleDownloadWelcomePack = () => {
    try {
        const doc = new jsPDF();
        
        // Set colors (orange: #f97316)
        const orangeColor = '#f97316';
        
        // Add logo from Cloudinary with rounded corners using Cloudinary transformations
        const logoUrl = "https://res.cloudinary.com/dm6mcyuvu/image/upload/c_thumb,g_center,h_200,w_200/r_max/v1771598823/Logo_r5gks2.png";
        
        // Add logo to PDF (Cloudinary already handles the rounding)
        doc.addImage(logoUrl, 'PNG', 20, 10, 30, 30);
        
        // Add PowerGym text next to logo
        doc.setFontSize(24);
        doc.setTextColor(orangeColor);
        doc.setFont("helvetica", "bold");
        doc.text("PowerGym", 55, 25);
        
        // Welcome line
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text("Welcome to the Family!", 105, 40, { align: 'center' });
        
        // Decorative line
        doc.setDrawColor(orangeColor);
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);
        
        // Member details section
        doc.setFontSize(14);
        doc.setTextColor(orangeColor);
        doc.setFont("helvetica", "bold");
        doc.text("MEMBER DETAILS", 20, 55);
        
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        
        let yPos = 65;
        const lineHeight = 7;
        
        if (member) {
            doc.text(`Name: ${member.name}`, 20, yPos);
            yPos += lineHeight;
            doc.text(`Email: ${member.email}`, 20, yPos);
            yPos += lineHeight;
            doc.text(`Phone: ${member.phone}`, 20, yPos);
            yPos += lineHeight;
            
            // Membership number with styling
            doc.setFont("helvetica", "bold");
            doc.setTextColor(orangeColor);
            doc.text(`Membership Number: ${member.membershipNumber}`, 20, yPos);
            yPos += lineHeight;
            
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            doc.text(`Status: ${member.status?.toUpperCase() || 'PENDING'}`, 20, yPos);
            yPos += lineHeight;
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
            yPos += 10;
        }
        
        // Next Steps section
        doc.setFontSize(14);
        doc.setTextColor(orangeColor);
        doc.setFont("helvetica", "bold");
        doc.text("NEXT STEPS", 20, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        
        if (nextSteps && nextSteps.length > 0) {
            nextSteps.forEach((step, index) => {
                doc.text(`${index + 1}. ${step}`, 25, yPos);
                yPos += lineHeight;
            });
            yPos += 5;
        }
        
        // What you can do now section
        doc.setFontSize(14);
        doc.setTextColor(orangeColor);
        doc.setFont("helvetica", "bold");
        doc.text("WHAT YOU CAN DO NOW", 20, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        const tips = [
            "Browse our class schedules",
            "Check out our trainer profiles",
            "Review membership benefits",
            "Prepare questions for orientation"
        ];
        
        tips.forEach((tip) => {
            doc.text(`• ${tip}`, 25, yPos);
            yPos += lineHeight;
        });
        yPos += 5;
        
        // Contact information
        doc.setFontSize(14);
        doc.setTextColor(orangeColor);
        doc.setFont("helvetica", "bold");
        doc.text("CONTACT INFORMATION", 20, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        doc.text(`Website: ${window.location.origin}`, 20, yPos);
        yPos += lineHeight;
        doc.text("Email: support@powergym.com", 20, yPos);
        yPos += lineHeight;
        doc.text("Phone: (555) 123-4567", 20, yPos);
        yPos += lineHeight;
        
        // Handle long address with text wrapping
        const addressLines = doc.splitTextToSize("Address: 123 Fitness Street, Workout City, WC 12345", 160);
        doc.text(addressLines, 20, yPos);
        yPos += (addressLines.length * lineHeight);
        
        // Footer
        yPos = 270;
        doc.setDrawColor(orangeColor);
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "italic");
        doc.text("We're excited to have you on board!", 105, yPos + 8, { align: 'center' });
        doc.text("The PowerGym Team", 105, yPos + 15, { align: 'center' });
        
        // Save the PDF
        doc.save(`PowerGym-Welcome-${member?.membershipNumber || 'Pack'}.pdf`);
        toast.success('Welcome pack downloaded!');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        toast.error('Failed to generate PDF');
    }
};

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
            
            {/* Background Pattern - Diagonal Lines in Orange */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full" 
                     style={{
                         backgroundImage: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 2px, transparent 2px, transparent 20px)'
                     }}>
                </div>
            </div>

            {/* Floating Gradient Orbs */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-orange opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-orange opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-orange opacity-5 rounded-full blur-3xl"></div>

            {/* Main Content Container */}
            <div className="relative z-10 max-w-4xl w-full">
                
                {/* Top Badge */}
                <div className="text-center mb-6">
                    <span className="inline-block text-orange-500 font-bold text-xs tracking-[0.2em] uppercase border border-orange-500/30 px-4 py-1.5 rounded-full bg-orange-500/5">
                        PowerGym
                    </span>
                </div>

                {/* Main Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    
                    {/* Inner Gradient Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-orange opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-orange opacity-5 rounded-full blur-3xl"></div>
                    
                    {/* "It's Time To Execute" Text */}
                    <div className="text-center mb-6 relative z-10">
                        <h2 className="text-orange-500 font-bold text-base md:text-lg tracking-[0.15em] uppercase mb-1">
                            It's Time To
                        </h2>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">
                            EXECUTE
                        </h1>
                    </div>

                    {/* Thank You Message */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-block bg-orange-500/5 px-5 py-2 rounded-full mb-4 border border-orange-500/20">
                            <span className="text-orange-500 font-bold text-sm">✓ THANK YOU</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                            You now have access to your membership dashboard where you can track your progress,
                            book sessions, and connect with trainers to accelerate your fitness journey.
                        </p>
                    </div>

                    {/* Member Info - With Copy Functionality */}
                    {member && (
                        <div className="border-t border-b border-gray-200 py-4 mb-8 relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                                <div className="text-center md:text-left">
                                    <span className="text-gray-500 text-xs block mb-1">MEMBER</span>
                                    <span className="text-gray-900 font-bold text-base">{member.name}</span>
                                </div>
                                <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
                                <div className="text-center md:text-left">
                                    <span className="text-gray-500 text-xs block mb-1">MEMBERSHIP ID</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-orange-500 font-mono font-bold text-base">{member.membershipNumber}</span>
                                        <button
                                            onClick={handleCopyMembership}
                                            className="p-1.5 hover:bg-orange-50 rounded-lg transition group relative"
                                            title="Copy membership number"
                                        >
                                            {copied ? (
                                                <FaCheck className="text-green-500 text-sm" />
                                            ) : (
                                                <FaCopy className="text-gray-400 group-hover:text-orange-500 text-sm" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
                                <div className="text-center md:text-left">
                                    <span className="text-gray-500 text-xs block mb-1">STATUS</span>
                                    <span className="text-orange-500 font-bold text-sm uppercase">{member.status || 'PENDING'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Next Steps - Minimal Grid */}
                    {nextSteps && nextSteps.length > 0 && (
                        <div className="grid md:grid-cols-3 gap-3 mb-8 relative z-10">
                            {nextSteps.map((step, index) => (
                                <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-orange-500/50 transition group relative overflow-hidden bg-white">
                                    <div className="absolute inset-0 bg-gradient-orange opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                    <div className="text-orange-500 font-bold text-xs mb-2">STEP 0{index + 1}</div>
                                    <p className="text-gray-700 text-xs leading-relaxed">{step}</p>
                                    <div className="mt-3 w-6 h-0.5 bg-orange-500/50 group-hover:w-8 transition-all"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Updated Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
                        <Link 
                            to="/" 
                            className="group inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-800 transition-all hover:scale-105 relative overflow-hidden shadow-md"
                        >
                            <span className="relative z-10">RETURN TO HOME</span>
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform relative z-10 text-sm" />
                        </Link>
                        
                        <Link 
                            to="/login" 
                            className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-orange-600 transition-all hover:scale-105 relative overflow-hidden shadow-md"
                        >
                            <FaFire className="text-base relative z-10" />
                            <span className="relative z-10">PROCEED TO LOGIN</span>
                        </Link>
                    </div>

                    {/* PDF Download Button */}
                    <div className="mt-6 text-center relative z-10">
                        <button
                            onClick={handleDownloadWelcomePack}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition group text-xs cursor-pointer"
                        >
                            <FaDownload className="group-hover:translate-y-1 transition-transform" />
                            <span className="text-xs uppercase tracking-wider">Download Welcome Pack (PDF)</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Tagline */}
                <div className="text-center mt-6">
                    <span className="text-gray-300 text-[10px] tracking-[0.2em] uppercase">
                        PowerGym • Where Champions Are Made
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ThankYou;