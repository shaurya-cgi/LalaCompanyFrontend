import React, {useState} from 'react'
import './Home.css'
import ItemDialog from '../components/ItemDialog.jsx';
import axios from "axios";

function Home() {
    const [items, setItems] = useState([]);
    const [showItemDialog, setShowItemDialog] = useState(false);
    const addItem = (newItem) => {
        setItems(prev => [...prev, newItem]);
        setShowItemDialog(false);
    };

  return (
    <>
    <div className='billingarea'>
        <h1>Generate Invoice</h1>
        <h3>Enter details for Invoice</h3>
        <div className='buyerinvoicedetails'>
            <div className='buyerdetails'>
                <label htmlFor="buyers" className='buyerselect'>Select Buyer:</label>
                <select name="buyers" id="buyers"  placeholder="Select Buyer" defaultValue="">
                <option value="" disabled hidden>Select Buyer</option>
                <option value="">Volvo</option>
                <option value="buyer1">Buyer1</option>
                <option value="buyer1">Buyer1</option>
                <option value="buyer1">Buyer1</option>
                <option value="newbuyer">Add New Buyer</option>
                </select>
                
                <label htmlFor="gstin">GSTIN</label>
                <input type="text" className="gstin" placeholder="Enter GSTIN" defaultValue="128919jdfjio09"></input>
                
                <label htmlFor="billingaddress">Billing Address</label>
                <textarea className="billingaddress" placeholder="Enter billing address" value="19-312-0, 12312, qwiejow-13124"></textarea>
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