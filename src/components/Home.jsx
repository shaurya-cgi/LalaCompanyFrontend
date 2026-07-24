import React from 'react'
import './Home.css'

function Home() {
  return (
    <>
    <div className='billingarea'>
        <h1>Generate Invoice</h1>
        <h3>Enter details for Invoice</h3>
        <div className='buyerinvoicedetails'>
            <div className='buyerdetails'>
                <label htmlFor="buyers" className='buyerselect'>Select Buyer:</label>
                <select name="buyers" id="buyers"  placeholder="Select Buyer">
                <option value="" disabled selected hidden>Select Buyer</option>
                <option value="">Volvo</option>
                <option value="buyer1">Buyer1</option>
                <option value="buyer1">Buyer1</option>
                <option value="buyer1">Buyer1</option>
                <option value="newbuyer">Add New Buyer</option>
                </select>
                
                <label htmlFor="gstin">GSTIN</label>
                <input type="text" className="gstin" placeholder="Enter GSTIN" value="128919jdfjio09"></input>
                
                <label htmlFor="billingaddress">Billing Address</label>
                <input type="text" className="billingaddress" placeholder="Enter billing address" value="19-312-0, 12312, qwiejow-13124"></input>
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
                <th>S.no</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>GstRate</th>
                <th>Price</th>
                <tr>
                    <td>1.</td>
                    <td>prod1</td>
                    <td>3</td>
                    <td>1000</td>
                    <td>18%</td>
                    <td>1180</td>
                </tr>
                <tr>
                    <td>2.</td>
                    <td>prod2</td>
                    <td>5</td>
                    <td>2144</td>
                    <td>18%</td>
                    <td>2910</td>
                </tr>
                <tr>
                    <td>3.</td>
                    <td>prod1</td>
                    <td>3</td>
                    <td>1000</td>
                    <td>18%</td>
                    <td>1180</td>
                </tr>
                <tr>
                    <td>4.</td>
                    <td><select name="product" id="productselector">
                        <option value="p1">p1</option>
                        <option value="p2">p2</option>
                        </select>
                    </td>

                </tr>
            </table>
            <div className='totaltable'>
                <table>
                    <tr>
                    <th>SubTotal</th>
                    <td>12000</td>
                    </tr>
                    <tr>

                    <th>GST</th>
                    <td>3000</td>
                    </tr>
                    <tr>

                    <th>Grand Total</th>
                    <td>15000</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    </>
  )
}

export default Home