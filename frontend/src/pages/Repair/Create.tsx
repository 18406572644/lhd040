import React, { useState } from 'react';
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
  Space,
  Card,
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconCamera,
  IconTool,
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockCustomers, mockClocks } from '@/mock/data';
import './style.css';

const FormItem = Form.Item;
const Option = Select.Option;
const Step = Steps.Step;

const RepairCreate: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const navigate = useNavigate();

  const customerClocks = mockClocks.filter((c) => c.customerId === selectedCustomer);

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

  const canNext = () => {
    if (currentStep === 0) {
      const customerId = form.getFieldValue('customerId');
      const clockId = form.getFieldValue('clockId');
      return customerId && clockId;
    }
    if (currentStep === 1) {
      const type = form.getFieldValue('type');
      const description = form.getFieldValue('description');
      return type && description;
    }
    return true;
  };

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
        >
          {currentStep === 0 && (
            <div className="step-content">
              <FormItem
                field="customerId"
                label="选择客户"
                rules={[{ required: true, message: '请选择客户' }]}
              >
                <Select
                  placeholder="请选择客户"
                  showSearch
                  onChange={(val) => setSelectedCustomer(val as string)}
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
                >
                  {customerClocks.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.brand} {c.model} ({c.type})
                    </Option>
                  ))}
                </Select>
              </FormItem>

              <FormItem field="type" label="维修类型" rules={[{ required: true, message: '请选择维修类型' }]}>
                <Radio.Group defaultValue="维修">
                  <Radio value="维修">维修</Radio>
                  <Radio value="保养">保养</Radio>
                  <Radio value="检测">检测</Radio>
                  <Radio value="翻新">翻新</Radio>
                </Radio.Group>
              </FormItem>

              <FormItem field="priority" label="优先级">
                <Radio.Group defaultValue="中">
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
                <Select placeholder="请选择技师" allowClear>
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

              <Card
                style={{ marginTop: '16px' }}
                title="信息确认"
                bordered
              >
                <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: '2' }}>
                  <p>请确认以上信息无误后点击"提交"按钮创建维修单。</p>
                  <p>提交后，系统将自动生成维修单号并通知相关人员。</p>
                </div>
              </Card>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            <Button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              上一步
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                className="steampunk-btn"
                disabled={!canNext()}
                onClick={() => setCurrentStep(currentStep + 1)}
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
