import { useState } from 'react';
import OcxSpinner from './OcxSpinner';

const OcxPageSpinner = () => {

	return (
        <div className="flex justify-center page-lock-frame">
            <OcxSpinner size="16" />
        </div>

	);
}

export default OcxPageSpinner;