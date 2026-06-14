import React, { useState, useCallback } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Message,
  Steps,
  Radio,
  Card,
  Alert,
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconCamera,
  IconTool,
  IconInfoCircle,
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockCustomers, mockClocks } from '@/mock/data';
import './style.css';

const FormItem = Form.Item;
const Option = Select.Option;
const Step = Steps.Step;

interface FormValues {
  customerId?: string;
  clockId?: string;
  type?: string;
  priority?: string;
  description?: string;
  expectedDate?: any;
  technician?: string;
  notes?: string;
}

const RepairCreate: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [formValues, setFormValues] = useState<FormValues>({
    type: '维修',
    priority: '中',
  });
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const customerClocks = mockClocks.filter((c) => c.customerId === selectedCustomer);

  const handleValuesChange = useCallback((_: any, allValues: FormValues) => {
    if (allValues.customerId !== selectedCustomer) {
      setSelectedCustomer(allValues.customerId || '');
      if (allValues.customerId) {
        form.setFieldsValue({ clockId: undefined });
        allValues.clockId = undefined;
      }
    }
    setFormValues({ ...allValues });
    setStepErrors([]);
  }, [form, selectedCustomer]);

  const validateStep = (step: number): { valid: boolean; errors: string[] } => {
    const values = { ...formValues, ...form.getFieldsValue() } as FormValues;
    const errors: string[] = [];
    if (step === 0) {
      if (!values.customerId) errors.push('请选择客户');
      if (!values.clockId) errors.push('请选择钟表');
      if (!values.type) errors.push('请选择维修类型');
    }
    if (step === 1) {
      if (!values.description || !values.description.trim()) errors.push('请填写故障描述');
    }
    return { valid: errors.length === 0, errors };
  };

  const canNext = () => {
    return validateStep(currentStep).valid;
  };

  const handleNext = () => {
    const { valid, errors } = validateStep(currentStep);
    if (!valid) {
      setStepErrors(errors);
      Message.warning(errors[0]);
      return;
    }
    setStepErrors([]);
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setStepErrors([]);
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      await form.validate();
      Message.success('维修单创建成功！');
      navigate('/repairs');
    } catch (e) {
      Message.error('请填写完整信息');
    }
  };

  const steps = [
    { title: '基本信息', description: '选择客户和钟表' },
    { title: '维修信息', description: '填写维修详情' },
    { title: '照片上传', description: '上传维修前照片' },
  ];

  const currentValues = { ...formValues, ...form.getFieldsValue() } as FormValues;
  const selectedCustomerData = mockCustomers.find((c) => c.id === currentValues.customerId);
  const selectedClockData = mockClocks.find((c) => c.id === currentValues.clockId);

  return (
    <div className="page-container">
      <div className="detail-header">
        <Button type="text" icon={<IconArrowLeft />} onClick={() => navigate('/repairs')}>
          返回列表
        </Button>
      </div>

      <SteampunkCard
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconTool style={{ color: 'var(--color-brass-light)' }} />
            新增维修单
          </div>
        }
      >
        <Steps current={currentStep} style={{ marginBottom: '32px', padding: '0 20px' }} lineless>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: '700px', margin: '0 auto' }}
          initialValues={{ type: '维修', priority: '中' }}
          onValuesChange={handleValuesChange}
        >
          {currentStep === 0 && (
            <div className="step-content">
              {stepErrors.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  icon={<IconInfoCircle />}
                  style={{ marginBottom: '20px' }}
                  content={
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {stepErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  }
                />
              )}
              <FormItem
                field="customerId"
                label="选择客户"
                rules={[{ required: true, message: '请选择客户' }]}
              >
                <Select
                  placeholder="请选择客户"
                  showSearch
                  allowClear
                  style={{ width: '100%' }}
                >
                  {mockCustomers.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name} - {c.phone}
                    </Option>
                  ))}
                </Select>
              </FormItem>

              <FormItem
                field="clockId"
                label="选择钟表"
                rules={[{ required: true, message: '请选择钟表' }]}
              >
                <Select
                  placeholder={selectedCustomer ? '请选择钟表' : '请先选择客户'}
                  disabled={!selectedCustomer}
                  showSearch
                  allowClear
                  style={{ width: '100%' }}
                >
                  {customerClocks.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.brand} {c.model} ({c.type})
                    </Option>
                  ))}
                </Select>
              </FormItem>

              <FormItem
                field="type"
                label="维修类型"
                rules={[{ required: true, message: '请选择维修类型' }]}
              >
                <Radio.Group>
                  <Radio value="维修">维修</Radio>
                  <Radio value="保养">保养</Radio>
                  <Radio value="检测">检测</Radio>
                  <Radio value="翻新">翻新</Radio>
                </Radio.Group>
              </FormItem>

              <FormItem field="priority" label="优先级">
                <Radio.Group>
                  <Radio value="低">低</Radio>
                  <Radio value="中">中</Radio>
                  <Radio value="高">高</Radio>
                  <Radio value="紧急">紧急</Radio>
                </Radio.Group>
              </FormItem>
            </div>
          )}

          {currentStep === 1 && (
            <div className="step-content">
              {stepErrors.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  icon={<IconInfoCircle />}
                  style={{ marginBottom: '20px' }}
                  content={
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {stepErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  }
                />
              )}
              <FormItem
                field="description"
                label="故障描述"
                rules={[{ required: true, message: '请填写故障描述' }]}
              >
                <Input.TextArea
                  placeholder="请详细描述故障情况..."
                  rows={4}
                  maxLength={500}
                  showWordLimit
                />
              </FormItem>

              <FormItem field="expectedDate" label="预计完成日期">
                <DatePicker style={{ width: '100%' }} placeholder="选择预计完成日期" />
              </FormItem>

              <FormItem field="technician" label="分配技师">
                <Select placeholder="请选择技师" allowClear style={{ width: '100%' }}>
                  <Option value="张师傅">张师傅</Option>
                  <Option value="李师傅">李师傅</Option>
                  <Option value="王师傅">王师傅</Option>
                </Select>
              </FormItem>

              <FormItem field="notes" label="备注">
                <Input.TextArea placeholder="请输入备注信息" rows={3} />
              </FormItem>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <FormItem label="维修前照片">
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  multiple
                  limit={10}
                  tip="支持 jpg、png 格式，单张不超过 5MB"
                >
                  <IconCamera />
                  <div style={{ marginTop: 4 }}>上传照片</div>
                </Upload>
              </FormItem>

              <Card style={{ marginTop: '16px' }} title="信息确认" bordered>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: '2' }}>
                  <p>
                    <strong style={{ color: 'var(--color-brass-light)' }}>客户：</strong>
                    {selectedCustomerData ? `${selectedCustomerData.name} (${selectedCustomerData.phone})` : '-'}
                  </p>
                  <p>
                    <strong style={{ color: 'var(--color-brass-light)' }}>钟表：</strong>
                    {selectedClockData ? `${selectedClockData.brand} ${selectedClockData.model} (${selectedClockData.type})` : '-'}
                  </p>
                  <p>
                    <strong style={{ color: 'var(--color-brass-light)' }}>维修类型：</strong>
                    {currentValues.type || '-'}
                  </p>
                  <p>
                    <strong style={{ color: 'var(--color-brass-light)' }}>优先级：</strong>
                    {currentValues.priority || '-'}
                  </p>
                  <p>
                    <strong style={{ color: 'var(--color-brass-light)' }}>故障描述：</strong>
                    {currentValues.description || '-'}
                  </p>
                  <p style={{ marginTop: '12px' }}>请确认以上信息无误后点击"提交"按钮创建维修单。</p>
                  <p>提交后，系统将自动生成维修单号并通知相关人员。</p>
                </div>
              </Card>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            <Button disabled={currentStep === 0} onClick={handlePrev}>
              上一步
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                className="steampunk-btn"
                disabled={!canNext()}
                onClick={handleNext}
              >
                下一步
              </Button>
            ) : (
              <Button type="primary" className="steampunk-btn" onClick={handleSubmit}>
                提交维修单
              </Button>
            )}
          </div>
        </Form>
      </SteampunkCard>
    </div>
  );
};

export default RepairCreate;
