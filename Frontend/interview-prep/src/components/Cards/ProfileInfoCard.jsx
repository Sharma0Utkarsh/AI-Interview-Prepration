import React , { useContext }from 'react'
    import { useNavigate } from 'react-router-dom'
    import { UserContext } from '../../context/userContext';
    import { getInitials } from '../../utils/helper';
    
    const ProfileInfoCard = () => {
        const { user, clearUser } = useContext(UserContext);
        const navigate = useNavigate();
    
        const handleLogout = () => {
            clearUser(); // Clear context and local storage
            navigate("/");
        };
    
        // If no user, don't render anything
        if (!user) {
            return null;
        }
    
      return (
        <div className='flex items-center gap-3'>
            {/* Profile Image or Initials */}
            {user.profileImageUrl ? (
                <img
                    src = {user.profileImageUrl}
                    alt="Profile"
                    className='w-10 h-10 rounded-full object-cover border border-gray-200'
                />
            ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm border border-blue-200">
                    {getInitials(user.name)}
                </div>
            )}
            
            {/* Name and Logout Button */}
            <div>
                <div className='text-sm font-medium text-gray-800'>
                    {user.name || ""}
                </div>
                <button
                    className='text-xs text-red-500 hover:underline'
                    onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
      )
    }
    
    export default ProfileInfoCard