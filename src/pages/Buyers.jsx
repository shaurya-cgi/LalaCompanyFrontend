import React , {useState} from 'react'
import './Buyers.css'
import BuyerFormDialog from '../components/BuyerFormDialog'

function Buyers() {
    const [showCreateBuyerDialog, setShowCreateBuyerDialog] =  useState(false);


  return (
    <>
    <div className='buyermainarea'>
        <h1>Buyers</h1>
        <div className='buyersearchadd'>
            <div className='buyersearch'>
            <label htmlFor="buyerSearch">Search Buyer by Name</label>
            <input type="text" placeholder='Enter Buyer Name'/>
        </div>
<button
  onClick={() => {
    console.log("Add Buyer Clicked");
    setShowCreateBuyerDialog(true);
  }}
>
  Add Buyer
</button>
        </div>
        <table>
            <thead>
                <tr>
                <th>S.No.</th>
                <th>Party Name</th>
                <th>GSTIN</th>
                <th>City</th>
                <th>State</th>
                <th>Pin Code</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr> 
                <td>1</td>
                <td>Name1</td>
                <td>1123jklj12</td>
                <td>New Delhi</td>
                <td>Delhi</td>
                <td>110023</td>
                <td><button id='editbutton'>Edit</button> <button id='deletebutton'>Delete</button></td>
                </tr>
                <tr>
                <td>1</td>
                <td>Name1</td>
                <td>1123jklj12</td>
                <td>New Delhi</td>
                <td>Delhi</td>
                <td>110023</td>
                <td><button id='editbutton'>Edit</button> <button id='deletebutton'>Delete</button></td>
                </tr>
                <tr >
                <td>1</td>
                <td>Name1</td>
                <td>1123jklj12</td>
                <td>New Delhi</td>
                <td>Delhi</td>
                <td>110023</td>
                <td><button id='editbutton'>Edit</button> <button id='deletebutton'>Delete</button></td>
                </tr>
                <tr >
                <td>1</td>
                <td>Name1</td>
                <td>1123jklj12</td>
                <td>New Delhi</td>
                <td>Delhi</td>
                <td>110023</td>
                <td><button id='editbutton'>Edit</button> <button id='deletebutton'>Delete</button></td>
                </tr>
                <tr >
                <td>1</td>
                <td>Name1</td>
                <td>1123jklj12</td>
                <td>New Delhi</td>
                <td>Delhi</td>
                <td>110023</td>
                <td><button id='editbutton'>Edit</button> <button id='deletebutton'>Delete</button></td>
                </tr>
                <tr >
                <td>1</td>
                <td>Name1</td>
                <td>1123jklj12</td>
                <td>New Delhi</td>
                <td>Delhi</td>
                <td>110023</td>
                <td><button id='editbutton'>Edit</button> <button id='deletebutton'>Delete</button></td>
                </tr>
            </tbody>
        </table>
        </div>
        {
          showCreateBuyerDialog && (
            <BuyerFormDialog
              onClose={() => setShowCreateBuyerDialog(false)}
            />
          )
        }
        </>
  )
}
export default Buyers