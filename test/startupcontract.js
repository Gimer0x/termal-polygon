const { expectRevert } = require('@openzeppelin/test-helpers');
const StartupContract = artifacts.require('StartupContract');

contract('StartupContract', (accounts) => {
    let startupContract = null;
    let _status = true;
    const _owner = accounts[0];
    const _startupWallet = accounts[1];
    const _notOwner = accounts[2];
    const _newOwner = accounts[3];
    const _investorWallet = accounts[4];
    const _first = 1;
    const _second = 2;
    const _nullAddress = "0x0000000000000000000000000000000000000000";

    const _initialLoan = 100;
    const _interestRate = 2; 
    const _maxConvertionRate = 15;
    const _minConvertionRate = 5;
    const _termalCoinPercentage = 20;
    const _stableCoinPercentage = 80;
    const _maxProjectTime = 18;
    
    before(async () => {
        startupContract = await StartupContract.new(
            _startupWallet, 
            _initialLoan,
            _interestRate, 
            _maxConvertionRate, 
            _minConvertionRate, 
            _termalCoinPercentage, 
            _stableCoinPercentage,
            _maxProjectTime,
            {from: _owner}
            );
    });

    it('Should set accounts[0] as owner', async () => {
        const owner = await startupContract.owner();
        assert(owner == _owner, "Owner incorrect!");
    });

    it('Different address should not be able to accept contract', async () => {
        _status = await startupContract.signature();
        assert(!_status, "Contract's status should be false!");

        await expectRevert(
            startupContract.startupSignature({from: _notOwner}),
            "Only startup should accept!"
          );
    });

    it('Startup should be active to accept a contract', async () => {
        /*await startupProfile.newStartupStatus(false, {from: _owner});
        assert(!(await startupProfile.status()));

        await expectRevert(
            startupContract.startupSignature({from: _startupWallet}),
            "Only active startups!"
        );

        await startupProfile.newStartupStatus(true, {from: _owner});*/
    });

    it('Startup should be able to accept contract', async () => {
        _status = await startupContract.signature();
        assert(!_status, "Contract's status should be false!");
               
        await startupContract.startupSignature({from: _startupWallet});
        
        _status = await startupContract.signature();
        assert(_status, "Contract's status should be true!");
    });

});

