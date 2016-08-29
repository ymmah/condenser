import React, { PropTypes, Component } from 'react';
import {connect} from 'react-redux';
import ReactDOM from 'react-dom';
import transaction from 'app/redux/Transaction';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

class PromotePost extends Component {

    static propTypes = {
        author: PropTypes.string.isRequired,
        permlink: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            amount: '1.0',
            asset: '',
            loading: false,
            amountError: '',
            trxError: ''
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.errorCallback = this.errorCallback.bind(this);
        this.amountChange = this.amountChange.bind(this);
        // this.assetChange = this.assetChange.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            ReactDOM.findDOMNode(this.refs.amount).focus()
        }, 300)
    }

    errorCallback(estr) {
        this.setState({ trxError: estr, loading: false });
    }

    onSubmit(e) {
        e.preventDefault();
        const {author, permlink, onClose} = this.props
        const {amount} = this.state
        this.setState({loading: true});
        console.log('-- PromotePost.onSubmit -->');
        this.props.dispatchSubmit({amount, asset: 'SBD', author, permlink, onClose,
            currentUser: this.props.currentUser, errorCallback: this.errorCallback});
    }

    amountChange(e) {
        const amount = e.target.value;
        console.log('-- PromotePost.amountChange -->', amount);
        this.setState({amount});
    }

    // assetChange(e) {
    //     const asset = e.target.value;
    //     console.log('-- PromotePost.assetChange -->', e.target.value);
    //     this.setState({asset});
    // }

    render() {
        const {amount, loading, amountError, trxError} = this.state;
        // const {currentAccount} = this.props;
        // const balanceValue =
        //     !asset || asset.value === 'STEEM' ? currentAccount.get('balance') :
        //     asset.value === 'SBD' ? currentAccount.get('sbd_balance') :
        //     null

        const submitDisabled = !amount;

        return (
           <div className="PromotePost row">
               <div className="column small-12">
                   <form onSubmit={this.onSubmit} onChange={() => this.setState({trxError: ''})}>
                       <h4>Promote Post</h4>

                       <p>Spend you Steem Dollars to advertise this post in the promoted content section. This doesn&apos;t pay the author directly, instead the funds are &#8220;burned.&#8221;  When funds are burned, they become a dividend to share holders.</p>

                       <hr />

                       <div className="row">
                           <div className="column small-4">
                               <label>Amount</label>
                               <div className="input-group">
                                   <input className="input-group-field" type="text" placeholder="Amount" value={amount} ref="amount" autoComplete="off" disabled={loading} onChange={this.amountChange} />
                                   <span className="input-group-label">SD ($)</span>

                                   <div className="error">{amountError}</div>
                               </div>
                               {/*<AssetBalance balanceValue={balanceValue} />*/}
                           </div>
                       </div>
                       <br />
                       {loading && <span><LoadingIndicator type="circle" /><br /></span>}
                       {!loading && <span>
                           {trxError && <div className="error">{trxError}</div>}
                           <button type="submit" className="button" disabled={submitDisabled}>Promote</button>
                        </span>}
                   </form>
               </div>
           </div>
       )
    }
}

// const AssetBalance = ({onClick, balanceValue}) =>
//     <a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>Balance: {balanceValue}</a>

export default connect(
    (state, ownProps) => {
        const currentUser = state.user.getIn(['current']);
        const currentAccount = state.global.getIn(['accounts', currentUser.get('username')]);
        return {...ownProps, currentAccount, currentUser}
    },

    // mapDispatchToProps
    dispatch => ({
        dispatchSubmit: ({amount, asset, author, permlink, currentUser, onClose, errorCallback}) => {
            const username = currentUser.get('username')
            const successCallback = () => {
                dispatch({type: 'global/GET_STATE', payload: {url: `@${username}/transfers`}}) // refresh transfer history
                onClose()
            }
            const operation = {
                from: username,
                to: 'null', amount: parseFloat(amount, 10).toFixed(3) + ' ' + asset,
                memo: author + '/' + permlink
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'transfer',
                operation,
                successCallback,
                errorCallback
            }))
        }
    })
)(PromotePost)
