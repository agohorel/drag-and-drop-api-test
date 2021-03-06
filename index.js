class ResizableWindow {
  constructor(props) {
    this.parent = props.parent;
    this.component = null;
    this.moveHandle = null;
    this.resizableMargin = 10;
    this.width = window.innerWidth / 6;
    this.height = 300;
    this.isResizable = false;
    this.isMovable = false;
    this.resizeFrom = null;
    this.x = props.x;
    this.y = props.y;
    this.initialX = null;
    this.initialY = null;
    this.initialMouseX = null;
    this.initialMouseY = null;
    this.initialWidth = null;
    this.initialHeight = null;
    this.moveHandleHeight = 35;
    this.isWindowBeingResized = false;
    this.windowBeforeResize = null;
    this.windowAfterResize = null;
    this.zIndex = 0;
  }

  createComponent = () => {
    const component = document.createElement("div");
    component.style.width = `${this.width}px`;
    component.style.height = `${this.height}px`;
    component.style.left = `${this.x}px`;
    component.style.top = `${this.y}px`;
    component.classList.add("pane");
    this.component = component;

    const moveHandle = document.createElement("div");
    moveHandle.style.width = `${this.width}px`;
    moveHandle.style.height = `${this.moveHandleHeight}px`;
    moveHandle.classList.add("move-handle");
    this.moveHandle = moveHandle;

    this.attachEventListeners();
    this.debounce(500, () => {
      this.resizeWindows();
    });

    component.appendChild(moveHandle);
    document.querySelector(this.parent).appendChild(this.component);
  };

  attachEventListeners = () => {
    this.component.addEventListener("mousedown", this.onMouseDown);
    this.component.addEventListener("mousemove", this.showResizeHandles);

    this.moveHandle.addEventListener("mousedown", this.move_onMouseDown);
    this.moveHandle.addEventListener("mouseup", this.move_onMouseUp);

    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);
  };

  checkIfMoveableArea = e => {
    if (
      e.offsetX < this.width - this.resizableMargin &&
      e.offsetX > this.resizableMargin &&
      e.offsetY < this.moveHandleHeight &&
      e.offsetY > this.resizableMargin
    ) {
      return true;
    }
  };

  move_onMouseDown = e => {
    e.preventDefault();
    if (this.checkIfMoveableArea(e)) {
      e.stopPropagation();
      this.isMovable = true;
      this.initialMouseX = e.offsetX;
      this.initialMouseY = e.offsetY;
      this.zIndex = this.findHighestZIndex() + 1;
      this.component.style.zIndex = `${this.zIndex}`;
    }
  };

  findHighestZIndex = () => {
    let record = 0;
    const panes = document.querySelectorAll(".pane");
    panes.forEach(pane => {
      if (pane.style.zIndex > record) {
        record = Number(pane.style.zIndex);
      }
    });
    return record;
  };

  move_onMouseUp = () => {
    this.isMovable = false;
    this.initialMouseX = null;
    this.initialMouseY = null;
  };

  move = e => {
    this.x = e.pageX - this.initialMouseX;
    this.y = e.pageY - this.initialMouseY;
    this.component.style.top = `${this.y}px`;
    this.component.style.left = `${this.x}px`;
  };

  onMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();
    this.checkIfResizableArea(e);
  };

  checkIfResizableArea = e => {
    if (
      e.offsetX > this.width - this.resizableMargin &&
      e.offsetY > this.height - this.resizableMargin
    ) {
      this.resizeFrom = "bottom-right";
    } else if (
      e.offsetX > this.width - this.resizableMargin &&
      e.offsetY < this.resizableMargin
    ) {
      this.resizeFrom = "top-right";
    } else if (
      e.offsetX < this.resizableMargin &&
      e.offsetY > this.height - this.resizableMargin
    ) {
      this.resizeFrom = "bottom-left";
    } else if (
      e.offsetX < this.resizableMargin &&
      e.offsetY < this.resizableMargin
    ) {
      this.resizeFrom = "top-left";
    } else if (e.offsetX > this.width - this.resizableMargin) {
      this.resizeFrom = "right";
    } else if (e.offsetX < this.resizableMargin) {
      this.resizeFrom = "left";
    } else if (e.offsetY > this.height - this.resizableMargin) {
      this.resizeFrom = "bottom";
    } else if (e.offsetY < this.resizableMargin) {
      this.resizeFrom = "top";
    }

    this.isResizable = true;
    this.initialMouseX = e.pageX;
    this.initialMouseY = e.pageY;
    this.initialX = this.x;
    this.initialY = this.y;
    this.initialWidth = this.width;
    this.initialHeight = this.height;
  };

  onMouseUp = () => {
    this.isResizable = false;
    this.resizeFrom = null;
    this.initialMouseX = null;
    this.initialMouseY = null;
  };

  onMouseMove = e => {
    if (this.isResizable) {
      this.transform(e);
    } else if (this.isMovable) {
      this.move(e);
    }
  };

  transform = e => {
    if (this.resizeFrom === "right") {
      this.resizeRight(e);
    } else if (this.resizeFrom === "left") {
      this.resizeLeft(e);
    } else if (this.resizeFrom === "bottom") {
      this.resizeBottom(e);
    } else if (this.resizeFrom === "top") {
      this.resizeTop(e);
    } else if (this.resizeFrom === "top-right") {
      this.resizeRight(e);
      this.resizeTop(e);
    } else if (this.resizeFrom === "bottom-right") {
      this.resizeRight(e);
      this.resizeBottom(e);
    } else if (this.resizeFrom === "top-left") {
      this.resizeLeft(e);
      this.resizeTop(e);
    } else if (this.resizeFrom === "bottom-left") {
      this.resizeLeft(e);
      this.resizeBottom(e);
    }
  };

  resizeRight = e => {
    this.width = e.pageX - this.component.getBoundingClientRect().left;
    this.component.style.width = `${this.width}px`;
    this.moveHandle.style.width = `${this.width}px`;
  };

  resizeLeft = e => {
    this.x = this.initialX + (e.pageX - this.initialMouseX);
    this.component.style.left = `${this.x}px`;
    this.width = this.initialWidth - (e.pageX - this.initialMouseX);
    this.component.style.width = `${this.width}px`;
    this.moveHandle.style.width = `${this.width}px`;
  };

  resizeTop = e => {
    this.y = this.initialY + (e.pageY - this.initialMouseY);
    this.component.style.top = `${this.y}px`;
    this.height = this.initialHeight - (e.pageY - this.initialMouseY);
    this.component.style.height = `${this.height}px`;
  };

  resizeBottom = e => {
    this.height = e.pageY - this.component.getBoundingClientRect().top;
    this.component.style.height = `${this.height}px`;
  };

  showResizeHandles = e => {
    if (this.checkIfMoveableArea(e)) {
      this.component.style.cursor = "move";
    } else if (
      e.offsetX > this.width - this.resizableMargin &&
      e.offsetY > this.height - this.resizableMargin
    ) {
      this.component.style.cursor = "se-resize";
    } else if (
      e.offsetX > this.width - this.resizableMargin &&
      e.offsetY < this.resizableMargin
    ) {
      this.component.style.cursor = "ne-resize";
    } else if (
      e.offsetX < this.resizableMargin &&
      e.offsetY > this.height - this.resizableMargin
    ) {
      this.component.style.cursor = "sw-resize";
    } else if (
      e.offsetX < this.resizableMargin &&
      e.offsetY < this.resizableMargin
    ) {
      this.component.style.cursor = "nw-resize";
    } else if (e.offsetX > this.width - this.resizableMargin) {
      this.component.style.cursor = "e-resize";
    } else if (e.offsetX < this.resizableMargin) {
      this.component.style.cursor = "w-resize";
    } else if (e.offsetY > this.height - this.resizableMargin) {
      this.component.style.cursor = "s-resize";
    } else if (e.offsetY < this.resizableMargin) {
      this.component.style.cursor = "n-resize";
    }
  };

  debounce = (delay, callback) => {
    window.addEventListener("resize", this.runDebounce(delay, callback));
  };

  runDebounce = (delay, callback) => {
    let debouncer;
    return (this.curried = () => {
      if (!this.isWindowBeingResized) {
        this.isWindowBeingResized = true;
        this.windowBeforeResize = {
          x: window.innerWidth,
          y: window.innerHeight
        };
      }
      clearTimeout(debouncer);
      debouncer = setTimeout(() => {
        this.isWindowBeingResized = false;
        this.windowAfterResize = {
          x: window.innerWidth,
          y: window.innerHeight
        };
        callback();
      }, delay);
    });
  };

  resizeWindows = () => {
    this.component.style.transition = "0.2s ease-out all";
    this.moveHandle.style.transition = "0.2s ease-out all";

    const widthRatio = this.windowAfterResize.x / this.windowBeforeResize.x;
    this.width *= widthRatio;
    this.component.style.width = `${this.width}px`;
    this.moveHandle.style.width = `${this.width}px`;

    this.x *= widthRatio;
    this.component.style.left = `${this.x}px`;

    // @todo add promise
    setTimeout(() => {
      this.component.style.transition = "none";
      this.moveHandle.style.transition = "none";
    }, 500);
  };
}

new ResizableWindow({
  parent: "body",
  x: window.innerWidth / 4,
  y: window.innerHeight / 4 - 50
}).createComponent();

new ResizableWindow({
  parent: "body",
  x: window.innerWidth / 2,
  y: window.innerHeight / 4 - 50
}).createComponent();

new ResizableWindow({
  parent: "body",
  x: window.innerWidth / 4,
  y: window.innerHeight / 2 + 50
}).createComponent();

new ResizableWindow({
  parent: "body",
  x: window.innerWidth / 2,
  y: window.innerHeight / 2 + 50
}).createComponent();
