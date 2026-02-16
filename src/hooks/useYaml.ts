import { useState, useMemo } from 'react'
import yaml from 'js-yaml'
import { parseYamlToTree } from '../utils/parseYamlToTree'
import type { TreeNodeData } from '../types'

const DEFAULT_YAML = `# YAML Viewer - Sample Data
# 可直接編輯此 YAML，右側樹狀圖會即時更新

application:
  name: dev-console
  version: "4.27.0"
  description: AI-Stack Enterprise 機器學習協作管理平台

pages:
  - name: Entry Page
    routes:
      sign_in:
        - provider: Github
          action: identity_provider.login
          scope: All Users
          target: Self
        - provider: Google
          action: identity_provider.login
          scope: All Users
          target: Self
        - provider: 帳號密碼
          action: user.login
          scope: All Users
          target: Self
      forgot_password:
        action: account_setting.reset_password
        scope: All Users
        target: Self
      sign_up:
        action: user.create
        scope: All Users
        target: Self

  - name: Workspace
    description: 專案與容器管理工作區
    sections:
      - name: Projects
        items:
          - name: Create Project
            action: project.create
            roles: [Admin, Manager]
          - name: View Project
            action: project.read
            roles: [Admin, Manager, Member]
          - name: Delete Project
            action: project.delete
            roles: [Admin]
      - name: Containers
        items:
          - name: Launch Container
            action: container.create
            gpu_required: true
          - name: Stop Container
            action: container.stop
          - name: View Logs
            action: container.logs

  - name: The Hub
    description: 鏡像與模型管理中心
    sections:
      - name: Images
        items:
          - name: Pull Image
            action: image.pull
          - name: Push Image
            action: image.push
          - name: Build Image
            action: image.build
            dockerfile_required: true
      - name: Models
        items:
          - name: Upload Model
            action: model.upload
            max_size: "50GB"
          - name: Deploy Model
            action: model.deploy
            requires: [gpu, endpoint]

settings:
  theme: dark
  language: zh-TW
  gpu_monitoring:
    enabled: true
    refresh_interval: 5000
    metrics:
      - utilization
      - memory_usage
      - temperature
      - power_draw
  notifications:
    email: true
    slack: false
    webhook: null

infrastructure:
  clusters:
    - name: gpu-cluster-01
      nodes: 8
      gpus_per_node: 4
      gpu_type: NVIDIA A100
      total_memory: "320GB"
    - name: gpu-cluster-02
      nodes: 4
      gpus_per_node: 8
      gpu_type: NVIDIA H100
      total_memory: "640GB"
  storage:
    type: ceph
    capacity: "100TB"
    replication_factor: 3
`

interface UseYamlReturn {
  content: string
  setContent: (content: string) => void
  filename: string
  setFilename: (name: string) => void
  parsed: unknown
  error: string | null
  tree: TreeNodeData[]
}

export function useYaml(): UseYamlReturn {
  const [content, setContent] = useState(DEFAULT_YAML)
  const [filename, setFilename] = useState('sample.yaml')

  const { parsed, error } = useMemo(() => {
    try {
      const result = yaml.load(content)
      return { parsed: result, error: null }
    } catch (e) {
      return { parsed: null, error: (e as Error).message }
    }
  }, [content])

  const tree = useMemo(() => parseYamlToTree(parsed), [parsed])

  return { content, setContent, filename, setFilename, parsed, error, tree }
}
