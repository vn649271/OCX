const ASSET_PENDING = 0;
const ASSET_SUBMITTED = 1;
const ASSET_DECLINED = 2;
const ASSET_RESUBMITTED = 3;
const ASSET_APPROVED = 4;
const ASSET_MINTED = 5;
const ASSET_LOANED = 6;
const ASSET_BURNED = 7;

const ASSET_STATUS_LABELS = [
    "Pending",  // 0
    "Submitted",
    "Declined",
    "Resubmitted",
    "Approved", // 4
    "Minted",
    "Loaned",
    "Burned",   // 7
]    

module.exports = {
    ASSET_PENDING,
    ASSET_SUBMITTED,
    ASSET_DECLINED,
    ASSET_RESUBMITTED,
    ASSET_APPROVED,
    ASSET_MINTED,
    ASSET_LOANED,
    ASSET_BURNED,
    ASSET_STATUS_LABELS    
};
