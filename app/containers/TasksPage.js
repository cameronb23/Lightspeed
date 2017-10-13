import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Tasks from '../components/Tasks';
import * as CounterActions from '../actions/counter';

function mapStateToProps(state) {
  return {
    tasks: state.tasks
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(CounterActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Tasks);
