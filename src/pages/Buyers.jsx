import React , {useState, useEffect} from 'react'
import './Buyers.css'
import BuyerFormDialog from '../components/BuyerFormDialog'
import buyerApi from "../api/buyerApi";

function Buyers() {
    const [showCreateBuyerDialog, setShowCreateBuyerDialog] =  useState(false);
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [showEditBuyerDialog, setShowEditBuyerDialog] =  useState(false);
    const [buyers, setBuyers] = useState([]);

    useEffect(() => {
        buyerApi.getAll()
            .then((res) => {
                console.log("SUCCESS");
                console.log(res.data);

                setBuyers(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);
    const addBuyer = (newBuyer) => {
        setBuyers(prev => [...prev, newBuyer]);
        setShowCreateBuyerDialog(false);
    }
    const handleSaveBuyer = async (newBuyer) => {
        try {
            const response = await buyerApi.create(newBuyer);

            setBuyers(prev => [
                ...prev,
                response.data
            ]);

            setShowCreateBuyerDialog(false);
        }
        catch (error) {
            console.error(error);
        }
    };
    const handleUpdateBuyer = async (updatedBuyer) => {
        try {
            await buyerApi.update(
                updatedBuyer.id,
                updatedBuyer
            );

            setBuyers(prev =>
                prev.map(b =>
                    b.id === updatedBuyer.id
                        ? updatedBuyer
                        : b
                )
            );

            setShowEditBuyerDialog(false);
            }
            catch (error) {
                console.error(error);
            }
    };
    const handleDeleteBuyer = async (id) => {

        if (!window.confirm("Delete this buyer?")) {
            return;
        }

        try {
            await buyerApi.delete(id);

            setBuyers(prev =>
                prev.filter(buyer => buyer.id !== id)
            );
        }
        catch (error) {
            console.error(error);
        }
    };

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
                    <tr key={buyer.id}>
                        <td>{index + 1}</td>
                        <td>{buyer.partyName}</td>
                        <td>{buyer.gstin}</td>
                        <td>{buyer.city}</td>
                        <td>{buyer.state}</td>
                        <td>{buyer.pinCode}</td>
                        <td>
                            <button
                                className="editbutton"
                                onClick={() => {
                                    setSelectedBuyer(buyer);
                                    setShowEditBuyerDialog(true);
                                }}
                            >
                                Edit
                            </button>

                            <button className="deletebutton" onClick={() => handleDeleteBuyer(buyer.id)}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
        {
            showCreateBuyerDialog && (
            <BuyerFormDialog
                onSave={handleSaveBuyer}
                onClose={() => setShowCreateBuyerDialog(false)}
            />
            )
        }
        {
            showEditBuyerDialog && (
            <BuyerFormDialog
                buyer={selectedBuyer}
                onSave={handleUpdateBuyer}
                onClose={() => setShowEditBuyerDialog(false)}
            />
            )
        }
        </>
    )
}
export default Buyers