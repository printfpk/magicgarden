import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Upload, X, CreditCard, Info, CheckCircle } from 'lucide-react';
import './Download.css';

export default function Download() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get('/api/store-items');
        setResources(res.data);
      } catch (err) {
        console.error("Failed to fetch store items", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Ultimate fail-proof scroll lock
  React.useEffect(() => {
    if (selectedResource) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [selectedResource]);

  const handleBuyClick = (resource) => {
    setSelectedResource(resource);
    setFileName("");
  };

  const closeModal = () => {
    setSelectedResource(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h2 className="marketplace-title">Study Resources</h2>
        <p className="marketplace-subtitle">Premium notes, guides, and flashcards to ace your dental exams.</p>
      </div>

      <div className="resources-grid">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', width: '100%', color: 'var(--text-muted)' }}>Loading resources...</div>
        ) : resources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', width: '100%', color: 'var(--text-muted)' }}>No resources available right now.</div>
        ) : (
          resources.map((resource) => (
            <div key={resource._id || resource.id} className="resource-card">
              <img src={resource.image || 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600'} alt={resource.title} className="resource-image" />
              <div className="resource-content">
                <span className="resource-category">{resource.category}</span>
                <h3 className="resource-title">{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>

                <div className="resource-footer">
                  <span className="resource-price">₹{resource.price}</span>
                  <button
                    className="buy-btn"
                    onClick={() => handleBuyClick(resource)}
                  >
                    <ShoppingCart size={16} /> Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedResource && (
        <div className="payment-modal-overlay" onClick={closeModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={20} />
            </button>

            <div className="modal-header">
              <h3 className="modal-title">Complete Purchase</h3>
              <p className="modal-subtitle">You are purchasing: {selectedResource.title}</p>
            </div>

            <div className="modal-body">
              <div className="payment-section">
                <div className="qr-code-placeholder">
                  {selectedResource.qrCodeImage ? (
                    <img src={selectedResource.qrCodeImage} alt="Payment QR Code" />
                  ) : (
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=your-upi-id@bank&pn=MagicStudy&am=${selectedResource.price}&cu=INR`} alt="Payment QR Code Placeholder" />
                  )}
                </div>
                <div className="payment-amount">₹{selectedResource.price}</div>
                <p className="payment-instruction">Scan to pay via any UPI app (GPay, PhonePe, Paytm)</p>
              </div>

              <div className="info-alert">
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>After payment, fill out this form and upload the screenshot. We will email you the PDF within 24 hours.</span>
              </div>

              <form action="https://api.web3forms.com/submit" method="POST" encType="multipart/form-data">
                {/* Replace with your actual Web3Forms Access Key */}
                <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
                <input type="hidden" name="subject" value={`Payment Submission: ${selectedResource.title}`} />
                <input type="hidden" name="purchased_item" value={selectedResource.title} />
                <input type="hidden" name="amount" value={selectedResource.price} />
                <input type="hidden" name="redirect" value={window.location.href} />

                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" className="form-control" placeholder="Enter your name" required />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" className="form-control" placeholder="Where should we send the PDF?" required />
                </div>

                <div className="form-group">
                  <label>WhatsApp Number</label>
                  <input type="tel" name="phone" className="form-control" placeholder="For quick updates" required />
                </div>

                <div className="form-group">
                  <label>Payment Screenshot</label>
                  <div className="file-upload-wrapper">
                    <input type="file" name="attachment" accept="image/*" onChange={handleFileChange} required />
                    <div className="file-upload-display">
                      {fileName ? (
                        <><CheckCircle size={20} color="var(--accent-emerald)" /> {fileName}</>
                      ) : (
                        <><Upload size={20} /> Tap to upload screenshot</>
                      )}
                    </div>
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  <CreditCard size={18} /> Submit Details
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
