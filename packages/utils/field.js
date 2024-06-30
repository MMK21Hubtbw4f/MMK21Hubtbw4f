import _ from 'lodash-es'
import { nanoid } from './nanoid'
const fieldsRe = /^(input|textarea|number|radio|checkbox|select|time|date|rate|switch|slider|html|cascader|uploadfile|signature|region)$/
const deepTraversal = (node, fn) => {
  fn(node)
  const nodes = node.list || node.rows || node.columns || node.children || []
  nodes.forEach(e => {
    deepTraversal(e, fn)
  })
}
const wrapElement = (element, fn) => {
  // const result = _.cloneDeep(element)
  const result = element
  deepTraversal(result, (node) => {
    if (!node.id) {
      node.id = nanoid()
    }
    if (!node.key) {
      node.key = `${node.type}_${node.id}`
    }
    // if (checkIsField(node.type) || /^(grid|tabs|collapse|table)$/.test(node.type)) {
    //   node.style = {
    //     width: '100%'
    //   }
    // }
    if (/^(grid|tabs|collapse|table|divider)$/.test(node.type)) {
      node.style = {
        width: '100%'
      }
    }
    if (checkIsField(node.type)) {
      node.style = {
        width: {
          pc: '100%',
          mobile: '100%'
        }
      }
    }
    if (/^(grid|col|collapse|collapseCol|tabs|tabsCol)$/.test(node.type)) {
      if (!node.style) {
        node.style = {}
      }
      Object.assign(node.style, {
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        padding: {
          top: 8,
          right: 8,
          bottom: 8,
          left: 8
        },
        background: {
          color: '',
          image: '',
          repeat: 'repeat',
          position: 'center center',
          attachment: 'scroll',
          size: 'auto'
        },
        isCustomBackground: false,
        border: {
          width: 0,
          style: 'none',
          color: '#4285f4'
        },
        borderRadius: 0
      })
    }
    if (/^(table)$/.test(node.type)) {
      Object.assign(node.style, {
        borderColor: '#000',
        borderType: 0,
        borderWidth: 1,
        background: {
          color: '',
          image: '',
          repeat: 'repeat',
          position: 'center center',
          attachment: 'scroll',
          size: 'auto'
        },
        isCustomBackground: false
      })
    }
    if (/^(tabs)$/.test(node.type)) {
      node.columns = new Array(3).fill('').map((e, index) => {
        const data = renderFieldData('tabsCol')
        data.label = `Tab ${index + 1}`
        return data
      })
    }
    if (/^(collapse)$/.test(node.type)) {
      node.columns = new Array(3).fill('').map((e, index) => {
        const data = renderFieldData('collapseCol')
        data.label = `Tab ${index + 1}`
        return data
      })
    }
    if (/^(td)$/.test(node.type)) {
      node.style = {
        padding: {
          top: 8,
          right: 8,
          bottom: 8,
          left: 8
        },
        background: {
          color: '',
          image: '',
          repeat: 'repeat',
          position: 'center center',
          attachment: 'scroll',
          size: 'auto'
        },
        isCustomBackground: false
      }
    }
    if (/^(radio|cascader|checkbox|select)$/.test(node.type)) {
      // console.log(123123)
      // state.data[node.id] = {
      //   type: node.type,
      //   list: utils.generateOptions(3).map((e, i) => {
      //     e.label += i + 1
      //     return e
      //   })
      // }

    }
    // if (/^(uploadfile|signature|html)$/.test(node.type)) {
    //   node.options.action = ER.props.fileUploadURI
    // }
    fn && fn(node)
  })
  return result
}
const renderFieldData = (type) => {
  const result = {
    id: nanoid(),
    type,
    label: '',
    list: []
  }
  // switch (type) {
  //   case 'tabsCol':
  //   // {
  //   //   label: 'Tab 1',
  //   //     type: 'tabsCol',
  //   //   id: 'Tab 1',
  //   //   list: []
  //   // }
  //     break
  // }
  return result
}
// const flatNodes = (nodes, leafOnly = false) => {
//   return nodes.reduce((res, node) => {
//     if (node.isLeaf) {
//       res.push(node)
//     } else {
//       !leafOnly && res.push(node)
//       res = res.concat(flatNodes(node.children, leafOnly))
//     }
//     return res
//   }, [])
// }
const excludes = ['grid', 'col', 'table', 'tr', 'td', 'tabs', 'tabsCol', 'collapse', 'collapseCol', 'divider', 'inline']
const flatNodes = (nodes, excludes, fn, excludesFn) => {
  return nodes.reduce((res, node, currentIndex) => {
    if (excludes.indexOf(node.type) === -1) {
      res.push(node)
      fn && fn(nodes, node, currentIndex)
    } else {
      excludesFn && excludesFn(nodes, node, currentIndex)
    }
    const children = node.list || node.rows || node.columns || node.children || []
    res = res.concat(flatNodes(children, excludes, fn, excludesFn))
    return res
  }, [])
}
const getAllFields = (store) => flatNodes(store, excludes)
const pickfields = (list) => {
  return flatNodes(list, excludes)
}
// const combinationData = (data) => {
//   const result = {
//     list: data.list,
//     config: data.config,
//     data: data.data
//   }
//   flatNodes(data.list, excludes, (nodes, node, currentIndex) => {
//     const cur = _.find(data.fields, { key: node })
//     if (!_.isEmpty(cur)) {
//       nodes[currentIndex] = cur
//     }
//   })
//   return result
// }
const disassemblyData1 = (data) => {
  const result = {
    list: data.list,
    config: data.config,
    fields: flatNodes(data.list, excludes, (nodes, node, currentIndex) => {
      nodes[currentIndex] = node.id
    }),
    data: data.data
  }
  return result
}
const combinationData1 = (data) => {
  const result = {
    list: data.list,
    config: data.config,
    data: data.data
  }
  flatNodes(data.list, excludes, (nodes, node, currentIndex) => {
    const cur = _.find(data.fields, { id: node })
    if (!_.isEmpty(cur)) {
      nodes[currentIndex] = cur
    }
  })
  return result
}
const combinationData2 = (list, fields) => {
  flatNodes(list, excludes, (nodes, node, currentIndex) => {
    const cur = _.find(fields, { id: node })
    if (!_.isEmpty(cur)) {
      nodes[currentIndex] = cur
    } else {
      nodes.splice(currentIndex, 1)
    }
  })
  flatNodes(list, excludes, null, (nodes, node, currentIndex) => {
    if (node.type === 'inline') {
      if (!node.columns.length) {
        nodes.splice(currentIndex, 1)
      }
    }
  })
  // list.forEach(e => {
  //   deepTraversal(e, (node) => {
  //     if (node.type === 'inline') {
  //       console.log(node)
  //     }
  //   })
  // })
}
const disassemblyData2 = (list) => {
  flatNodes(list, excludes, (nodes, node, currentIndex) => {
    nodes[currentIndex] = node.id
  })
  // const result = {
  //   list: data.list,
  //   config: data.config,
  //   fields: flatNodes(data.list, excludes, (nodes, node, currentIndex) => {
  //     nodes[currentIndex] = node.key
  //   }),
  //   data: data.data
  // }
  // return result
}
const checkIslineChildren = (node) => node.context.parent.type === 'inline'
const checkIsField = (type) => fieldsRe.test(type)
const calculateAverage = (count, total = 100) => {
  const base = Math.floor(total / count)
  const rest = total % count
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(base + (i < rest ? 1 : 0))
  }
  return result
}
const syncWidthByPlatform = (node, platform, value) => {
  const isArray = _.isArray(node)
  if (!isArray) {
    if (_.isObject(node.style.width)) {
      node.style.width[platform] = value + '%'
    } else {
      node.style.width = value + '%'
    }
  }
  const otherNodes = isArray ? node : node.context.parent.columns.filter(e => e !== node)
  const averageWidths = calculateAverage(otherNodes.length, isArray ? 100 : 100 - value)
  otherNodes.forEach((node, index) => {
    const isFieldWidth = _.isObject(node.style.width)
    if (isFieldWidth) {
      node.style.width[platform] = averageWidths[index] + '%'
    } else {
      node.style.width = averageWidths[index] + '%'
    }
  })
}
const fieldLabel = (t, node) => t(`er.fields.${node.type === 'input' ? `${node.type}.${node.options.renderType - 1}` : `${node.type}`}`)
export {
  syncWidthByPlatform,
  wrapElement,
  deepTraversal,
  renderFieldData,
  getAllFields,
  disassemblyData1,
  combinationData1,
  disassemblyData2,
  combinationData2,
  checkIslineChildren,
  checkIsField,
  pickfields,
  fieldLabel
}
