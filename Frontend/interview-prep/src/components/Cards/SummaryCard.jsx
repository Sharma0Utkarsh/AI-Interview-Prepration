import React from 'react'
import { LuTrash2 } from 'react-icons/lu';
import { getInitials } from '../../utils/helper';
import { Link } from 'react-router-dom';

const SummaryCard = ({
    colors,
    role,
    topicsToFocus,
    experience,
    questions,
    description,
    lastUpdated,
    sessionId,
    onDelete,
   }) => {
  return (
    <Link
      to={`/interview-prep/${sessionId}`}
      className='block bg-white border border-gray-200/60 rounded-xl p-2.5 overflow-hidden hover:shadow-lg shadow-gray-100 relative group'
    >
      {/* Top Colored Section */}
      <div
        className='rounded-lg p-4 relative'
        style={{
          background: colors.bgcolor,
        }}
      >
        <div className='flex items-start'>
          <div className='flex-shrink-0 w-12 h-12 bg-white rounded-md flex items-center justify-center mr-4 '>
            <span className='text-lg font-semibold text-black'>
              {getInitials(role)}
            </span>
          </div>

          <div className='flex-grow'>
            <h2 className='text-[17px] font-medium text-gray-900'>{role}</h2>
            <p className='text-xs font-medium text-gray-800 opacity-80'>
              {topicsToFocus}
            </p>
          </div>
        </div>

        {/* Delete Button (Visible on Group Hover) */}
        <button 
          className='absolute top-3 right-3 w-8 h-8 hidden group-hover:flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-red-500'
          onClick={(e)=>{
              e.preventDefault();
              e.stopPropagation();
              onDelete();
          }}>
          <LuTrash2 size={16} />
        </button>
      </div>
      
      {/* Bottom Stats and Description Section */}
      <div className='px-3 pt-3 pb-2'>
        <div className='flex items-center justify-between gap-3 mb-3'>
            <div className='flex items-center gap-2 text-xs text-gray-600'>
                Experience: 
                <span className='font-semibold text-gray-800'>
                    {experience} {experience == 1 ? "Year" : "Years"}
                </span>
            </div>
            <div className='text-[10px] font-medium text-blue-700 bg-blue-50 px-3 py-1 border border-blue-200 rounded-full'>
                {questions} Q&A
            </div>
        </div>

        <p className='text-[12px] text-gray-500 font-medium line-clamp-2 mb-2'>
            {description}
        </p>

        <div className='text-[10px] font-medium text-gray-500'>
            Last Updated: {lastUpdated}
        </div>
      </div>
    </Link>
  );
};

export default SummaryCard;