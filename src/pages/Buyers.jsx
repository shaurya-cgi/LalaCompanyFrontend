import React , {useState} from 'react'
import './Buyers.css'
import BuyerFormDialog from '../components/BuyerFormDialog'

function Buyers() {
    const [showCreateBuyerDialog, setShowCreateBuyerDialog] =  useState(false);
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [showEditBuyerDialog, setShowEditBuyerDialog] =  useState(false);
    const [buyers, setBuyers] = useState([]);
    const addBuyer = (newBuyer) => {
        setBuyers(prev => [...prev, newBuyer]);
        setShowCreateBuyerDialog(false);
    }
    const handleSaveBuyer = (newBuyer) => {
        setBuyers([...buyers, newBuyer]);
    }

  return (
    <>
    <div className='buyermainarea'>
        <h1>Buyers</h1>
        <div className='buyersearchadd'>
            <button
            onClick={() => {console.log("Add Buyer Clicked");
                setShowCreateBuyerDialog(true);
            }}>Add Buyer</button>
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
                {buyers.map((buyer, index) => (
                            <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{buyer.itemName}</td>
                            <td>{buyer.quantity}</td>
                            <td>{buyer.rate}</td>
                            <td>{buyer.gst}</td>
                            <td>{buyer.price}</td>
                            </tr>
                        ))}

                <tr> 
                <td>1</td>
                <td>Name1</td>
                <td>1123jklj12</td>
                <td>New Delhi</td>
                <td>Delhi</td>
                <td>110023</td>
                <td>
                    <button id='editbutton'  onClick={() => {console.log("Edit Buyer Clicked"); setShowEditBuyerDialog(true);}}>Edit</button> 
                    <button id='deletebutton'>Delete</button>
                </td>
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
        {
            showEditBuyerDialog && (
            <BuyerFormDialog
                onClose={() => setShowEditBuyerDialog(false)}
            />
            )
        }
        </>
    )
}
export default Buyers