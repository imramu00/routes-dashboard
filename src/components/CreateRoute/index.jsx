import { useState } from 'react'
import axios from 'axios'
import { Button, Form, Input, Modal, Radio, Space, Select, message } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useForm } from 'antd/es/form/Form'
import { useDispatch } from 'react-redux'
import { addRoute } from '../../features/Routes/routesSlice'
import { nanoid } from '@reduxjs/toolkit'
import './styles.css'

const { Option } = Select

const mapboxToken = 'pk.eyJ1IjoicmFtYW5hdGhhbjVjIiwiYSI6ImNsZGVyZnFsOTBjeGMzcHBpdGxvamJvZnYifQ.9wLJVXOZucb7Slp64JNuMQ'

const CreateRouteModal = props => {
  const { isModalOpen, setIsModalOpen } = props
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [options, setOptions] = useState([])

  const [form] = useForm()

  const dispatch = useDispatch()

  const handleSearch = async value => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json?access_token=${mapboxToken}&autocomplete=true`
    let response = []
    try {
      response = await axios.get(url)
    } catch (e) {
      message.error(e?.message ?? 'Failed to serach places')
    }
    const options = (response?.data?.features || [])?.map(feature => ({
      value: feature.place_name,
      label: feature.place_name,
      details: {
        lon: feature?.geometry?.coordinates[0],
        lat: feature?.geometry?.coordinates[1],
      },
    }))
    setOptions(options)
  }

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  }

  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 20, offset: 0 },
    },
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const onFinish = values => {
    setConfirmLoading(true)
    const stops = values.stops.map(stop => JSON.parse(stop))
    const payload = {
      name: values.name,
      routeId: values.id,
      status: values.status,
      direction: values.direction,
      source: stops[0],
      destination: stops[values.stops.length - 1],
      stops: stops.slice(1, -1),
      key: nanoid(),
    }

    setTimeout(() => {
      dispatch(addRoute(payload))
      form.resetFields()
      setIsModalOpen(false)
      setConfirmLoading(false)
    }, 1000)
  }

  return (
    <Modal
      title='Create a new Route'
      open={isModalOpen}
      onOk={form.submit}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        layout='vertical'
        name='form_in_modal'
        initialValues={{
          modifier: 'public',
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name='name'
          label='Name'
          rules={[
            {
              required: true,
              message: 'Please input the Name for the route!',
            },
          ]}
        >
          <Input placeholder='Route Names' />
        </Form.Item>
        <Form.Item
          name='id'
          label='Route Id'
          rules={[
            {
              required: true,
              message: 'Please input the Route Id!',
            },
          ]}
        >
          <Input placeholder='Route Id' />
        </Form.Item>
        <Form.Item
          name='direction'
          label='Direction'
          className='collection-create-form_last-form-item'
          rules={[
            {
              required: true,
              message: 'Please select an option',
            },
          ]}
        >
          <Radio.Group>
            <Radio value='up'>Up</Radio>
            <Radio value='down'>Down</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name='status'
          label='Status'
          className='collection-create-form_last-form-item'
          rules={[
            {
              required: true,
              message: 'Please select an option',
            },
          ]}
        >
          <Radio.Group>
            <Radio value='Active'>Active</Radio>
            <Radio value='Inactive'>Inactive</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.List
          name='stops'
          rules={[
            {
              validator: async (_, names) => {
                if (!names || names.length < 2) {
                  return Promise.reject(new Error('At least 2 stops'))
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                  label={index === 0 ? 'Stops' : ''}
                  required={false}
                  key={field.key}
                  name={[field.name]}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: 'Please select a stop or delete this field.',
                      },
                    ]}
                    noStyle
                  >
                    <Select
                      showSearch
                      placeholder='Search for a place'
                      style={{ width: '70%' }}
                      onSearch={handleSearch}
                    >
                      {options.map(option => (
                        <Option
                          key={option.value}
                          value={JSON.stringify(option)}
                          coordinates={option.coordinates}
                        >
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className='dynamic-delete-button'
                      onClick={() => remove(field.name)}
                    />
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type='dashed'
                  onClick={() => {
                    setOptions([])
                    add()
                  }}
                  style={{ width: '60%' }}
                  icon={<PlusOutlined />}
                >
                  Add Stop
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}
export default CreateRouteModal
