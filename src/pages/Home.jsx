import React, {useState, useEffect} from 'react'
import './Home.css'
import ItemDialog from '../components/ItemDialog.jsx';
import buyerApi from '../api/buyerApi.js';

function Home() {
    const [buyers, setBuyers] = useState([]);
    const [selectedBuyerId, setSelectedBuyerId] = useState("");
    const [items, setItems] = useState([]);
    const [showItemDialog, setShowItemDialog] = useState(false);

    
    const addItem = (newItem) => {
        setItems(prev => [...prev, newItem]);
        setShowItemDialog(false);
    };
    useEffect(() => {
        buyerApi.getAll()
        .then(res => {
                setBuyers(res.data);
            })
            .catch(err => {
                console.error(err);
            });
        }, []);
        
        const selectedBuyer = buyers.find(
            buyer => buyer.id === Number(selectedBuyerId)
        );
        
        const billingAddress = selectedBuyer? `${selectedBuyer.billingAddress}, ${selectedBuyer.city}, ${selectedBuyer.state} - ${selectedBuyer.pinCode}`: "";
  
return (
    <>
    <div className='billingarea'>
        <h1>Generate Invoice</h1>
        <h3>Enter details for Invoice</h3>
        <div className='buyerinvoicedetails'>
            <div className='buyerdetails'>
                <label htmlFor="buyers" className='buyerselect'>Select Buyer:</label>
                    <select id="buyer" value={selectedBuyerId} 
                    onChange={(e) => setSelectedBuyerId(e.target.value)}>
                    <option value="">Select Buyer</option>
                    {buyers.map((buyer) => (<option key={buyer.id} value={buyer.id}>{buyer.partyName}</option>))}
                    </select>
                <label htmlFor="gstin">GSTIN</label>
                <input type="text" readOnly className="gstin" placeholder="Enter GSTIN" value={selectedBuyer?.gstin||""}></input>
                
                <label htmlFor="billingaddress">Billing Address</label>
                <textarea className="billingaddress" readOnly rows={3} placeholder="Enter billing address" value={billingAddress}></textarea>
            </div>
            <div className='invoicedetails'>

                <label htmlFor="invoiceno">Invoice No.</label>
                <input type="text" className="invoiceno" placeholder="Enter Invoice No." value="5"></input>

                <label htmlFor="invoicedate">Invoice Date</label>
                <input type="date" className='invoicedate' value="2002-12-21"></input>
            </div>
        </div>
        <div className='items'>
            <table>
                <thead>
                <tr>

                <th>S.no</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>GstRate</th>
                <th>Price</th>
                </tr>
                </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.itemName}</td>
                            <td>{item.quantity}</td>
                            <td>{item.rate}</td>
                            <td>{item.gst}</td>
                            <td>{item.price}</td>
                            </tr>
                        ))}

                        <tr>
                            <td colSpan={6}>
                            <button onClick={() => setShowItemDialog(true)}>
                                + Add Item
                            </button>
                            </td>
                        </tr>
                    </tbody>
            </table>
            <div className='totaltable'>
                <table>
                    <thead>

                    <tr>
                    <th>SubTotal</th>
                    <td>12000</td>
                    </tr>
                    <tr>

                    <th>GST</th>
                    <td>3000</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>

                    <th>Grand Total</th>
                    <td>15000</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div className='generateinvoice'>
            <button className='printinvoice'>Print Invoice</button>
            <button className='downloadinvoice'>Download Invoice</button>
        </div>
    </div>
    {
        showItemDialog &&(
            <ItemDialog onClose={()=>setShowItemDialog(false)} onSave={addItem}/>
        )
    }
    </>
  )
}

export default Home