import { useState } from 'react'
import { Table, Layout, Typography, Button, Modal, Timeline, Upload, message } from 'antd'
import { UpCircleFilled, DownCircleFilled, DeleteFilled, EditFilled, DownloadOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { nanoid } from '@reduxjs/toolkit'
import { addRoute, deleteRoute } from '../../features/Routes/routesSlice'
import CreateRouteModal from '../CreateRoute'
import EditRouteModal from '../EditRoute'
import MapboxDirectionsComponent from '../DirectionsMap'
import sampleJson from '../../Utils/sample.json'
import { contentStyle, headerStyle } from './layoutStyle'
import './styles.css'

const { Header, Content } = Layout

const MyTable = () => {
  const [expandKey, setExpandKey] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [id, setId] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [modalText, setModalText] = useState('Are you sure you want to delete?')

  const dispatch = useDispatch()
  const routeSlice = useSelector(state => state.routes)
  const oldValues = useSelector(state => state.routes)

  const showModal = id => {
    setId(id)
    setDeleteModalOpen(true)
  }

  const handleEdit = id => {
    setId(id)
    setIsEditModalOpen(true)
  }

  const handleOk = () => {
    setConfirmLoading(true)
    setModalText('Deleting the route')
    setTimeout(() => {
      dispatch(deleteRoute({ id }))
      setDeleteModalOpen(false)
      setModalText('Are you sure you want to delete?')
      setConfirmLoading(false)
    }, 1000)
  }
  const handleCancel = () => {
    setId(null)
    setModalText('Are you sure you want to delete?')
    setDeleteModalOpen(false)
  }

  const handleFileChange = async ({ file }) => {
    try {
      if (!file) return
      if (file.type !== 'application/json') return message.error('Invalid file type. Please select a json file.')
      const reader = new FileReader()
      reader.onload = e => {
        const jsonFile = JSON.parse(e.target.result)
        checkJson(jsonFile)
      }
      reader.readAsText(file.originFileObj)
    } catch (e) {
      message.error('Unable to upload the file, please check the file')
    }
  }

  const checkJson = file => {
    try {
      const newFile = file.map(val => {
        if (!val.name || !val.routeId || !val.status || !val.direction) {
          message.error('Name/Route Id/Status/Direction is missing')
          return
        }
        if (!val?.source?.value || !val?.source?.label || !val?.source?.details?.lon || !val?.source?.details?.lat) {
          message.error('Source details is not in proper formart')
          return
        }
        if (
          !val?.destination?.value ||
          !val?.destination?.label ||
          !val?.destination?.details?.lon ||
          !val?.destination?.details?.lat
        ) {
          message.error('Destination details is not in proper formart')
          return
        }
        if (val.stops) {
          val.stops.forEach(stop => {
            if (!stop.value || !stop.label || !stop.details?.lon || !stop.details?.lat) {
              message.error('Stop details are not in proper formart')
              return
            }
          })
        }
        return { ...val, key: nanoid() }
      })
      newFile.forEach(file => {
        dispatch(addRoute(file))
      })
      message.success('Bulk Upload Success')
    } catch (e) {
      message.error('Unable to upload the file, please check the file')
    }
  }

  const handleDownloadRoute = key => {
    let url = ''
    if (oldValues.routes.length > 0) {
      const route = oldValues.routes.find(route => route.key === key)
      const json = JSON.stringify(route)
      const blob = new Blob([json], { type: 'application/json' })
      url = URL.createObjectURL(blob)
    }
    const a = document.createElement('a')
    a.href = url
    a.download = `route-${key}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  const handleDownloadAllRoutes = () => {
    let url = ''
    const json = JSON.stringify(oldValues?.routes || [])
    const blob = new Blob([json], { type: 'application/json' })
    url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `routes.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const handleDownloadSample = () => {
    const blob = new Blob([sampleJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'routes.json'
    link.click()
  }

  const columns = [
    {
      title: 'Route Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Route Id',
      dataIndex: 'routeId',
      key: 'routeId',
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: text => text.value,
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      render: text => text.value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        const handleClick = key => {
          setExpandKey(key === expandKey ? null : key)
        }
        return (
          <div className='action-items'>
            <EditFilled onClick={() => handleEdit(record.key)} />
            <DownloadOutlined onClick={() => handleDownloadRoute(record.key)} />
            <DeleteFilled onClick={() => showModal(record.key)} />
            {expandKey === record.key ? (
              <UpCircleFilled
                type='caret-right'
                onClick={() => handleClick(null)}
              />
            ) : (
              <DownCircleFilled
                type='caret-right'
                onClick={() => handleClick(record.key)}
              />
            )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <Layout>
        <Header style={headerStyle}>
          <div className='dashboard-container'>
            <div className='dashboard-title'>
              <Typography.Title
                level={1}
                style={{ margin: 5 }}
              >
                Routes Dashboard
              </Typography.Title>
            </div>
            <Button
              type='primary'
              className='add-route-btn'
              onClick={() => setIsModalOpen(true)}
            >
              Add a Route
            </Button>
            <Button
              type='primary'
              className='download-all-btn'
              onClick={handleDownloadAllRoutes}
            >
              Download All Routes
            </Button>
            <Upload
              accept='.json'
              fileList={[]}
              multiple={false}
              onChange={handleFileChange}
              beforeUpload={file => {
                return true
              }}
            >
              <Button className='upload-btn'>Bulk Upload</Button>
            </Upload>
            <Button
              className='upload-btn'
              onClick={handleDownloadSample}
            >
              Download Sample
            </Button>
          </div>
        </Header>

        <Content style={contentStyle}>
          <Table
            dataSource={[...routeSlice.routes]}
            columns={columns}
            pagination={false}
            scroll={{ x: '100%', y: '100%' }}
            expandable={{
              expandedRowKeys: [expandKey],
              expandIcon: () => null,
              expandedRowRender: record => (
                <div className='accordian'>
                  <div className='accordian-container'>
                    <Timeline>
                      <Timeline.Item>{record.source.value}</Timeline.Item>
                      {(record.stops || []).map(stop => (
                        <Timeline.Item>{stop.value}</Timeline.Item>
                      ))}
                      <Timeline.Item>{record.destination.value}</Timeline.Item>
                    </Timeline>
                  </div>
                  <div
                    className='accordian-cointainer1'
                    key={record.source.details.lon}
                  >
                    <MapboxDirectionsComponent
                      source={record.source.details}
                      destination={record.destination.details}
                      waypoints={record.stops?.map(stop => ({ lat: stop.details.lat, lon: stop.details.lon }))}
                      key={record.source.details.lon}
                    />
                  </div>
                </div>
              ),
              rowExpandable: record => true,
            }}
          />
        </Content>
      </Layout>
      <CreateRouteModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <EditRouteModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        id={id}
      />
      <Modal
        title='Delete Route'
        open={deleteModalOpen}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>{modalText}</p>
      </Modal>
    </>
  )
}

export default MyTable
