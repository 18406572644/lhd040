import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Space, Message } from '@arco-design/web-react';
import { IconRefresh, IconCheck, IconClose } from '@arco-design/web-react/icon';

interface SignaturePadProps {
  onConfirm: (signature: string) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onConfirm,
  onCancel,
  width = 400,
  height = 200,
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleConfirm = () => {
    if (sigCanvas.current?.isEmpty()) {
      Message.warning('请先签名');
      return;
    }
    const signatureData = sigCanvas.current?.toDataURL('image/png');
    if (signatureData) {
      onConfirm(signatureData);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '12px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
        请在下方区域签名确认
      </div>
      <div
        style={{
          border: '2px dashed var(--color-brass-dark)',
          borderRadius: '8px',
          background: '#fffdf8',
          padding: '8px',
          width: width,
          height: height,
        }}
      >
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: width - 20,
            height: height - 20,
            className: 'signature-canvas',
            style: {
              width: '100%',
              height: '100%',
              cursor: 'crosshair',
            },
          }}
          onBegin={handleBegin}
          penColor="#3d2914"
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <Button icon={<IconRefresh />} onClick={handleClear}>
          清除
        </Button>
        <Space>
          <Button icon={<IconClose />} onClick={onCancel}>
            取消
          </Button>
          <Button
            type="primary"
            icon={<IconCheck />}
            onClick={handleConfirm}
            disabled={isEmpty}
            className="steampunk-btn"
          >
            确认签名
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default SignaturePad;
