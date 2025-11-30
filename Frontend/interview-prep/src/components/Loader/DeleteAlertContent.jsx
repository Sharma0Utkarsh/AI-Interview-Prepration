import React from 'react'
    
    const DeleteAlertContent = ({content, onDelete}) => {
      return (
        <div className='p-5'>
            <p className='text-[14px]'>{content}</p>
            <div className='flex justify-end mt-6'>
                <button
                type="button"
                className='px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600'
                onClick={onDelete}>
                    Delete
                </button>
            </div>
        </div>
        
      )
    }
    
    export default DeleteAlertContent