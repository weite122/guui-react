import * as React from 'react';
import {createScopedClasses} from 'utils/classes';
import {createRef} from 'react';
import './scroll.scss';

const componentName = 'Scroll';
const sc = createScopedClasses(componentName);

interface IEventHandlers {
  onTouchMove?: React.TouchEventHandler<Element>;
  onWheel?: React.WheelEventHandler<Element>;
}

interface IState {
  contentHeight: number;
  viewHeight: number;
  y: number;
}

export interface IProps extends IStyledProps {
}

class Scroll extends React.Component<IProps, IState> {
  static displayName = componentName;
  static defaultProps = {};
  static propTypes = {};
  private readonly refWrapper: React.RefObject<HTMLDivElement>;
  private readonly refContent: React.RefObject<HTMLDivElement>;
  private readonly refBar: React.RefObject<HTMLDivElement>;
  private readonly eventHandlers: IEventHandlers;

  constructor(props: IProps) {
    super(props);
    this.refWrapper = createRef();
    this.refContent = createRef();
    this.refBar = createRef();
    this.eventHandlers = {
      onWheel: (e) => {
        this.updateContentY(e.deltaY, () => e.preventDefault());
      },
      onTouchMove: (e) => {
        e.preventDefault();
      }
    };
    this.state = {
      y: 0,
      contentHeight: 0,
      viewHeight: 0,
    };
  }

  get contentRect() {
    return this.refContent.current!.getBoundingClientRect();
  }

  get wrapperRect() {
    return this.refWrapper.current!.getBoundingClientRect();
  }

  get barHeight() {
    return this.state.viewHeight * this.state.viewHeight / this.state.contentHeight;
  }

  get barY() {
    return this.state.y * this.state.viewHeight / this.state.contentHeight;
  }

  get scrollYMax() {
    if (!this.refContent.current || !this.refWrapper.current) {
      return 0;
    }
    const wrapper = this.refWrapper.current;
    const {borderTopWidth, borderBottomWidth, paddingTop, paddingBottom} = window.getComputedStyle(wrapper);
    const borderTopWidthNumber = parseInt(borderTopWidth!, 10);
    const borderBottomWidthNumber = parseInt(borderBottomWidth!, 10);
    const paddingTopNumber = parseInt(paddingTop!, 10);
    const paddingBottomNumber = parseInt(paddingBottom!, 10);
    return this.contentRect.height! - this.wrapperRect.height! + (borderTopWidthNumber + borderBottomWidthNumber + paddingTopNumber + paddingBottomNumber);
  }

  updateContentY(deltaY: number, callback?: () => void) {
    const y = this.state.y + this.scale(deltaY, 3, 60);
    if (y < 0) {
      this.setState({y: 0});
    } else if (y > this.scrollYMax) {
      this.setState({y: this.scrollYMax});
    } else {
      callback && callback();
      this.setState({y});
    }
  }

  scale(n: number, rate: number, limit: number) {
    const abs = Math.abs(n);
    if (abs < 2) {
      return n;
    }
    const result = n * rate;
    if (abs > limit) {
      return result > 0 ? limit : -limit;
    } else {
      return result;
    }
  }

  componentDidMount(): void {
    const content = this.refContent.current;
    const wrapper = this.refWrapper.current;
    if (content && wrapper) {
      const {height: contentHeight} = content.getBoundingClientRect();
      const {height: viewHeight} = wrapper.getBoundingClientRect();
      this.setState({contentHeight, viewHeight});
    }
  }

  render() {
    return (
      <div ref={this.refWrapper} className={sc()} style={this.props.style} {...this.eventHandlers}>
        <div ref={this.refContent} style={{
          transform: `translateY(-${this.state.y}px)`,
          transition: `all 50ms`
        }}>
          {this.props.children}
        </div>
        <div className={sc('track')}>
          <div ref={this.refBar} className={sc('track-bar')}
               style={{
                 transform: `translateY(${this.barY}px)`,
                 height: `${this.barHeight}px`
               }}>
            <div className={sc('track-bar-inner')}/>
          </div>
        </div>
      </div>
    );
  }

}

export default Scroll;