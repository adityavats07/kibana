import PropTypes from 'prop-types';
import { compose, branch, renderComponent, lifecycle } from 'recompose';
import { ArgTypeComponent } from './arg_type_component';
import { ArgTypeUnknown } from './arg_type_unknown';
import { ArgTypeContextPending } from './arg_type_context_pending';
import { ArgTypeContextError } from './arg_type_context_error';

function requiresContext(expressionType) {
  return Boolean(expressionType && expressionType.requiresContext);
}

// helper to check the state of the passed in expression type
function checkState(state) {
  return ({ context, expressionType }) => {
    const matchState = (!context || context.state === state);
    return requiresContext(expressionType) && matchState;
  };
}

const branches = [
  // if no expressionType was provided, render the ArgTypeUnknown component
  branch(props => !props.expressionType, renderComponent(ArgTypeUnknown)),
  // if the expressionType is in a pending state, render ArgTypeContextPending
  branch(checkState('pending'), renderComponent(ArgTypeContextPending)),
  // if the expressionType is in an error state, render ArgTypeContextError
  branch(checkState('error'), renderComponent(ArgTypeContextError)),
];

// dispatch context update if none is provided
const fetchContext = (props, force = false) => {
  const { expressionType, context, updateContext } = props;
  if (force || (context == null && requiresContext(expressionType))) {
    updateContext();
  }
};

const contextLifecycle = lifecycle({
  componentWillMount() {
    fetchContext(this.props);
  },
  componentWillReceiveProps(newProps) {
    const oldContext = this.props.contextExpression;
    const newContext = newProps.contextExpression;
    fetchContext(newProps, oldContext !== newContext);
  },
});

export const ArgType = compose(
  contextLifecycle,
  ...branches
)(ArgTypeComponent);

ArgType.propTypes = {
  expressionType: PropTypes.object,
  context: PropTypes.object,
  contextExpression: PropTypes.object,
  updateContext: PropTypes.func,
};
