'use client';

export function JewelFace() {
  return (
    <div className="jewel-face" aria-hidden="true">
      <img
        src="/images/jewel-face.png"
        alt=""
        className="jewel-face-img"
        width={400}
        height={500}
        draggable={false}
      />
      <div className="jewel-face-eyes">
        <EyeSlot side="left" />
        <EyeSlot side="right" />
      </div>
    </div>
  );
}

function EyeSlot({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`jewel-eye-slot jewel-eye-slot--${side}`}>
      <div className="jewel-eye-reveal">
        <div className="jewel-eye-iris">
          <div className="jewel-eye-pupil" />
          <div className="jewel-eye-shine" />
        </div>
      </div>
      <div className="jewel-lid jewel-lid--upper">
        <div className="jewel-lashes jewel-lashes--upper" />
      </div>
      <div className="jewel-lid jewel-lid--lower">
        <div className="jewel-lashes jewel-lashes--lower" />
      </div>
    </div>
  );
}
