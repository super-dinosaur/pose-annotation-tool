import React, {useState, useCallback, useEffect, useRef} from 'react';
import {Layout, Button, Upload, message, Tabs, Modal} from 'antd';
import {UploadOutlined, SaveOutlined, PlusOutlined, PlayCircleOutlined} from '@ant-design/icons';
import useVideoFrame from '../hooks/useVideoFrame';
import {calculateScaleFactor, exportAnnotationsToJson, importAnnotationsFromJson} from '../utils/videoUtils';
import KeypointAnnotator from './KeypointAnnotator/KeypointAnnotator';
import KeypointList from './ControlPanel/KeypointList';
import PersonManager from './ControlPanel/PersonManager';
import FrameSlider from './ControlPanel/FrameSlider';
import VideoInfo from './ControlPanel/VideoInfo';
import {KEYPOINTS} from '../constants/keypoints';
import './VideoAnnotator.css';

const {Header, Sider, Content, Footer} = Layout;
const {TabPane} = Tabs;

/**
 * 视频标注主组件
 * @returns {JSX.Element} - 返回视频标注主组件
 */
const VideoAnnotator = () => {
	const [videoSrc, setVideoSrc] = useState(null);
	const [videoName, setVideoName] = useState('');
	const [selectedKeypoint, setSelectedKeypoint] = useState(null);
	const [annotations, setAnnotations] = useState({});
	const [scale, setScale] = useState(1);
	const [persons, setPersons] = useState([]);
	const [selectedPerson, setSelectedPerson] = useState(null);
	const [nextPersonId, setNextPersonId] = useState(1);
	const [activeTab, setActiveTab] = useState('persons');
	const [isAddPersonModalVisible, setIsAddPersonModalVisible] = useState(false);
	const [newPersonName, setNewPersonName] = useState('');
	const [isInferencing, setIsInferencing] = useState(false);

	// 创建Modal的ref用于获取焦点
	const inputRef = useRef(null);

	// 使用自定义钩子处理视频帧
	const {
		videoInfo,
		currentFrame,
		totalFrames,
		frameImage,
		isLoading,
		nextFrame,
		prevFrame,
		goToFrame,
	} = useVideoFrame(videoSrc);

	// 更新nextPersonId以确保唯一性
	useEffect(() => {
		if (persons.length > 0) {
			// 找出当前最大的人物ID
			const maxId = persons.reduce((max, person) => {
				const personIdNum = parseInt(person.id, 10);
				return isNaN(personIdNum) ? max : Math.max(max, personIdNum);
			}, 0);

			// 设置nextPersonId为最大ID+1
			setNextPersonId(maxId + 1);
		}
	}, [persons]);

	// 处理视频上传
	const handleVideoUpload = useCallback((info) => {
		if (info.file.status === 'done') {
			const videoUrl = URL.createObjectURL(info.file.originFileObj);
			setVideoSrc(videoUrl);
			setVideoName(info.file.name);
			setAnnotations({});
			setSelectedKeypoint(null);
			message.success(`${info.file.name} 上传成功`);
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} 上传失败`);
		}
	}, []);

	// 处理关键点选择
	const handleKeypointSelect = useCallback((keypoint) => {
		setSelectedKeypoint(keypoint);
	}, []);

	// 处理标注
	const handleAnnotate = useCallback((frameIndex, personId, keypointId, position) => {
		if (!personId) {
			message.warning('请先选择或添加一个人物');
			return;
		}

		const frameKey = `frame_${frameIndex}`;

		setAnnotations(prev => {
			const frameAnnotations = prev[frameKey] || {};
			const personAnnotations = frameAnnotations[personId] || {};

			return {
				...prev,
				[frameKey]: {
					...frameAnnotations,
					[personId]: {
						...personAnnotations,
						[keypointId]: position
					}
				}
			};
		});

		// 自动选择下一个关键点
		if (selectedKeypoint) {
			const currentIndex = KEYPOINTS.findIndex(kp => kp.id === selectedKeypoint.id);
			if (currentIndex >= 0 && currentIndex < KEYPOINTS.length - 1) {
				// 如果不是最后一个关键点，选择下一个
				setSelectedKeypoint(KEYPOINTS[currentIndex + 1]);
			} else if (currentIndex === KEYPOINTS.length - 1) {
				// 如果是最后一个关键点，循环回到第一个
				setSelectedKeypoint(KEYPOINTS[0]);
			}
		}
	}, [selectedKeypoint]);

	// 保存标注数据
	const handleSaveAnnotations = useCallback(() => {
		if (Object.keys(annotations).length === 0) {
			message.warning('尚未添加任何标注数据');
			return;
		}

		const filename = `${videoName.split('.')[0]}_annotations.json`;
		exportAnnotationsToJson(annotations, persons, videoInfo, filename);
		message.success('标注数据保存成功');
	}, [annotations, videoName, persons, videoInfo]);

	// 显示添加人物的模态框
	const showAddPersonModal = useCallback(() => {
		setNewPersonName('');
		setIsAddPersonModalVisible(true);
		// 下一帧渲染后，使输入框获得焦点
		setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}, 100);
	}, []);

	// 处理添加人物模态框的确认
	const handleAddPersonModalOk = useCallback(() => {
		if (newPersonName.trim()) {
			const colorIndex = persons.length % KEYPOINTS.length;
			handleAddPerson(newPersonName, KEYPOINTS[colorIndex].color);
		}
		setIsAddPersonModalVisible(false);
	}, [newPersonName, persons.length]);

	// 添加人物
	const handleAddPerson = useCallback((name, color) => {
		// 检查是否已存在同名人物
		const existingSameName = persons.some(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
		if (existingSameName) {
			// 如果已存在同名人物，则修改人物名称避免重复
			name = `${name}_${Date.now().toString().slice(-4)}`;
		}

		// 确保ID的唯一性，查找已存在的最大ID值
		const maxId = persons.reduce((max, person) => {
			const personIdNum = parseInt(person.id, 10);
			return isNaN(personIdNum) ? max : Math.max(max, personIdNum);
		}, 0);

		// 新ID至少比当前最大ID大1，确保不会有重复
		const newPersonId = Math.max(maxId + 1, nextPersonId);

		// 再次确认该ID不存在于当前人物列表中
		const personIds = new Set(persons.map(p => p.id));
		let finalId = String(newPersonId);
		while (personIds.has(finalId)) {
			finalId = String(parseInt(finalId) + 1);
		}

		const newPerson = {
			id: finalId,
			name,
			color
		};

		setPersons(prev => [...prev, newPerson]);
		setSelectedPerson(newPerson);
		setNextPersonId(parseInt(finalId) + 1);

		// 自动切换到关键点标签页
		setActiveTab('keypoints');

		// 总是选择第一个关键点
		if (KEYPOINTS.length > 0) {
			setSelectedKeypoint(KEYPOINTS[0]);
		}
	}, [nextPersonId, persons]);

	// 编辑人物
	const handleEditPerson = useCallback((personId, name) => {
		setPersons(prev =>
			prev.map(person =>
				person.id === personId
					? {...person, name}
					: person
			)
		);
	}, []);

	// 删除人物
	const handleDeletePerson = useCallback((personId) => {
		// 删除人物
		setPersons(prev => prev.filter(person => person.id !== personId));

		// 如果删除的是当前选中的人物，则取消选中
		if (selectedPerson && selectedPerson.id === personId) {
			setSelectedPerson(null);
		}

		// 删除该人物的所有标注数据
		setAnnotations(prev => {
			const newAnnotations = {};

			// 遍历所有帧
			Object.keys(prev).forEach(frameKey => {
				const frameAnnotations = prev[frameKey];

				// 删除指定人物的标注
				const {[personId]: deletedPerson, ...restPersonsAnnotations} = frameAnnotations;

				// 如果帧中还有其他人物的标注，则保留该帧
				if (Object.keys(restPersonsAnnotations).length > 0) {
					newAnnotations[frameKey] = restPersonsAnnotations;
				}
			});

			return newAnnotations;
		});
	}, [selectedPerson]);

	// 处理标签页切换
	const handleTabChange = useCallback((key) => {
		setActiveTab(key);

		// 如果切换到关键点标签页，且有选中的人物，确保有关键点被选中
		if (key === 'keypoints' && selectedPerson) {
			// 如果当前没有选中关键点，则选择第一个关键点
			if (!selectedKeypoint && KEYPOINTS.length > 0) {
				setSelectedKeypoint(KEYPOINTS[0]);
			}
		}
	}, [selectedPerson, selectedKeypoint]);

	// 设置选中的人物并自动切换到关键点标签页
	const handlePersonSelect = useCallback((person) => {
		// 如果切换到不同的人物，则重置选中的关键点
		if (!selectedPerson || selectedPerson.id !== person.id) {
			setSelectedPerson(person);

			// 选择人物后自动切换到关键点标签页
			setActiveTab('keypoints');

			// 无论之前是否有选中关键点，都强制选择第一个关键点
			if (KEYPOINTS.length > 0) {
				setSelectedKeypoint(KEYPOINTS[0]);
			}
		} else {
			// 如果是选择同一个人物，则不改变当前选中的关键点
			setSelectedPerson(person);
		}
	}, [selectedPerson]);

	// 处理键盘快捷键
	useEffect(() => {
		const handleKeyDown = (e) => {
			// 不处理输入框内的快捷键
			if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
				// 在添加人物模态框中按下Enter键等同于点击确定按钮
				if (e.key === 'Enter' && isAddPersonModalVisible) {
					handleAddPersonModalOk();
				}
				return;
			}

			// Ctrl+N: 创建新人物
			if (e.ctrlKey && (e.key === 'n' || e.key === 'N')) {
				e.preventDefault(); // 阻止默认行为（如打开新窗口）
				showAddPersonModal();
				return; // 添加返回，确保不执行后续代码
			}

			// Tab键：在标签页之间循环切换
			if (e.key === 'Tab') {
				e.preventDefault(); // 阻止默认的Tab焦点切换行为

				// 在三个标签页之间循环切换：persons -> keypoints -> videoinfo -> persons
				const tabOrder = ['persons', 'keypoints', 'videoinfo'];
				const currentIndex = tabOrder.indexOf(activeTab);
				const nextIndex = (currentIndex + 1) % tabOrder.length;
				setActiveTab(tabOrder[nextIndex]);
			}

			// 可以添加更多快捷键...
		};

		// 使用捕获阶段监听事件，确保在浏览器默认行为之前处理
		window.addEventListener('keydown', handleKeyDown, true);

		return () => {
			window.removeEventListener('keydown', handleKeyDown, true);
		};
	}, [isAddPersonModalVisible, handleAddPersonModalOk, showAddPersonModal]);

	// 计算缩放比例
	useEffect(() => {
		if (videoInfo.width && videoInfo.height) {
			const contentElement = document.querySelector('.annotation-content');
			if (contentElement) {
				const containerWidth = contentElement.clientWidth;
				const containerHeight = contentElement.clientHeight;

				const newScale = calculateScaleFactor(
					videoInfo.width,
					videoInfo.height,
					containerWidth,
					containerHeight
				);

				setScale(newScale);
			}
		}
	}, [videoInfo.width, videoInfo.height]);

	// 处理推理下一帧
	const handleInferenceNextFrame = useCallback(async () => {
		if (!videoSrc) return;

		try {
			setIsInferencing(true);
			console.log('开始推理过程...');

			// 导出当前帧的标注信息
			const currentFrameAnnotations = annotations[`frame_${currentFrame}`] || {};
			console.log('当前帧标注信息:', currentFrameAnnotations);

			if (Object.keys(currentFrameAnnotations).length === 0) {
				throw new Error('当前帧没有标注信息，请先进行标注');
			}

			// 处理人物数据，确保ID的唯一性
			const processedPersons = {};

			// 过滤掉重复ID的人物
			const uniquePersons = persons.filter((person, index, self) =>
				index === self.findIndex(p => p.id === person.id)
			);

			// 确保每个人物的ID唯一且有合适的exportId作为标识
			uniquePersons.forEach(person => {
				// 使用基于名称的exportId，确保与示例格式一致
				const baseName = person.name.replace(/\s+/g, '_').toLowerCase();
				processedPersons[person.id] = {
					...person,
					exportId: `${baseName}_${person.id}`
				};
			});

			// 准备导出数据
			const exportData = {
				frame: currentFrame,
				annotations: currentFrameAnnotations,
				persons: processedPersons
			};

			// 将标注信息保存到本地文件
			const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'current_frame_annotations.json';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			message.info('已生成当前帧标注文件，正在等待推理结果...');

			// 开始轮询检查结果
			const checkResult = async () => {
				try {
					// 尝试读取推理结果文件
					const response = await fetch('/next_frame_annotations.json');
					if (response.ok) {
						const nextFrameData = await response.json();

						console.log('获取到下一帧数据:', nextFrameData);
						console.log('当前人物列表:', persons);

						// 确保格式一致性，提取annotations字段
						let nextFrameAnnotations = {};
						if (nextFrameData && nextFrameData.annotations) {
							nextFrameAnnotations = nextFrameData.annotations;
							console.log('下一帧标注数据(annotations字段):', nextFrameAnnotations);
						} else if (typeof nextFrameData === 'object' && !nextFrameData.annotations) {
							// 如果返回的是直接的标注数据（没有annotations包装），则直接使用
							nextFrameAnnotations = nextFrameData;
							console.log('下一帧标注数据(直接格式):', nextFrameAnnotations);
						}

						// 处理人物数据
						let updatedPersons = [...persons];
						let updatedAnnotations = {...nextFrameAnnotations};
						let nextFramePersons = {};

						// 提取人物数据
						if (nextFrameData.persons) {
							nextFramePersons = nextFrameData.persons;
						}

						console.log('检测到人物数据:', nextFramePersons);

						// 创建当前人物的映射，便于查找
						const currentPersonsByName = {};
						const currentPersonsById = {};
						updatedPersons.forEach(person => {
							currentPersonsByName[person.name.toLowerCase()] = person;
							currentPersonsById[person.id] = person;
						});

						// 跟踪是否处理了新的标注数据
						let hasProcessedNewAnnotations = false;

						// 处理新导入的人物数据
						Object.entries(nextFramePersons).forEach(([personIdInFile, personData]) => {
							const personName = personData.name || '';
							const lowerName = personName.toLowerCase();

							console.log(`处理人物: ${personName}, ID: ${personData.id || personIdInFile}, 文件中ID: ${personIdInFile}`);

							// 检查该人物ID在标注数据中是否有对应的关键点
							const hasAnnotations = !!nextFrameAnnotations[personIdInFile];
							console.log(`该人物在标注数据中${hasAnnotations ? '有' : '没有'}关键点数据`);

							// 尝试通过名称找到匹配的已有人物
							const existingPersonByName = currentPersonsByName[lowerName];
							// 尝试通过ID找到匹配的已有人物
							const existingPersonById = currentPersonsById[personData.id];

							console.log(`匹配结果 - 名称匹配: ${!!existingPersonByName}, ID匹配: ${!!existingPersonById}`);

							if (existingPersonByName) {
								// 如果名称匹配已有人物，使用已有人物的ID更新标注数据
								console.log(`找到名称匹配的人物: ${personName}，使用ID: ${existingPersonByName.id}`);

								// 如果文件中的关键点标注使用的是不同的ID，需要更新为正确的ID
								if (personIdInFile !== existingPersonByName.id && hasAnnotations) {
									console.log(`将标注从ID ${personIdInFile} 映射到 ${existingPersonByName.id}`);
									updatedAnnotations[existingPersonByName.id] = {...nextFrameAnnotations[personIdInFile]};
									delete updatedAnnotations[personIdInFile]; // 删除旧ID的标注
									hasProcessedNewAnnotations = true;
								}
							} else if (existingPersonById) {
								// 如果ID匹配已有人物，但名称不同，更新人物名称
								console.log(`找到ID匹配的人物: ${existingPersonById.name}，更新为: ${personName}`);

								const personIndex = updatedPersons.findIndex(p => p.id === personData.id);
								if (personIndex !== -1) {
									updatedPersons[personIndex] = {
										...updatedPersons[personIndex],
										name: personName,
										color: personData.color || updatedPersons[personIndex].color
									};
								}

								// 确保标注数据使用正确的ID
								if (personIdInFile !== personData.id && hasAnnotations) {
									console.log(`将标注从ID ${personIdInFile} 映射到 ${personData.id}`);
									updatedAnnotations[personData.id] = {...nextFrameAnnotations[personIdInFile]};
									delete updatedAnnotations[personIdInFile];
									hasProcessedNewAnnotations = true;
								}
							} else {
								// 完全新的人物，添加到列表
								console.log(`添加新人物: ${personName}, ID: ${personData.id || personIdInFile}`);

								// 确保新人物有有效的ID
								const newId = personData.id || personIdInFile || String(Date.now());

								// 添加新人物
								const newPerson = {
									id: newId,
									name: personName || `Person_${newId}`,
									color: personData.color || KEYPOINTS[updatedPersons.length % KEYPOINTS.length].color
								};

								updatedPersons.push(newPerson);

								// 如果文件中的关键点标注使用的是不同的ID，需要更新为正确的ID
								if (personIdInFile !== newId && hasAnnotations) {
									console.log(`将标注从ID ${personIdInFile} 映射到新ID ${newId}`);
									updatedAnnotations[newId] = {...nextFrameAnnotations[personIdInFile]};
									delete updatedAnnotations[personIdInFile]; // 删除旧ID的标注
									hasProcessedNewAnnotations = true;
								}
							}
						});

						// 如果没有处理过新的标注数据，但有标注数据，则直接使用
						if (!hasProcessedNewAnnotations && Object.keys(nextFrameAnnotations).length > 0) {
							console.log('直接使用原始标注数据，未进行ID映射');
							updatedAnnotations = {...nextFrameAnnotations};
						}

						console.log('更新后的人物列表:', updatedPersons);
						console.log('更新后的标注数据:', updatedAnnotations);

						// 更新人物列表
						setPersons(updatedPersons);

						// 准备下一帧的标注数据
						const nextFrameIndex = currentFrame + 1;
						const nextFrameKey = `frame_${nextFrameIndex}`;

						// 更新标注信息，使用处理后的标注数据
						setAnnotations(prev => {
							const newAnnotations = {
								...prev,
								[nextFrameKey]: updatedAnnotations
							};
							console.log(`最终的标注数据状态(${nextFrameKey}):`, newAnnotations[nextFrameKey]);
							return newAnnotations;
						});

						// 切换到下一帧
						setTimeout(() => {
							nextFrame();
							setIsInferencing(false);
							message.success('已加载下一帧标注结果');
						}, 500);

						// 删除结果文件
						await fetch('/api/delete-result', {method: 'POST'});
					} else {
						// 如果文件还不存在，继续等待
						setTimeout(checkResult, 1000);
					}
				} catch (error) {
					console.error('检查推理结果时出错:', error);
					setTimeout(checkResult, 1000);
				}
			};

			// 开始检查推理结果
			checkResult();

			// 设置超时
			setTimeout(() => {
				if (isInferencing) {
					setIsInferencing(false);
					message.error('推理超时，请检查推理脚本是否正常运行');
				}
			}, 120000); // 120秒超时

		} catch (error) {
			console.error('推理过程中出错:', error);
			setIsInferencing(false);
			message.error({
				content: `推理过程出错: ${error.message}`,
				duration: 5,
				style: {whiteSpace: 'pre-line'}
			});
		}
	}, [currentFrame, annotations, persons, videoSrc, nextFrame]);

	return (
		<Layout className="video-annotator-layout">
			<Header className="annotator-header">
				<div className="toolbar">
					<Upload
						name="video"
						showUploadList={false}
						beforeUpload={(file) => {
							const isVideo = file.type.startsWith('video/');
							if (!isVideo) {
								message.error('请上传视频文件!');
							}
							return isVideo;
						}}
						customRequest={({file, onSuccess}) => {
							setTimeout(() => {
								onSuccess("ok");
							}, 0);
						}}
						onChange={handleVideoUpload}
					>
						<Button icon={<UploadOutlined />} type="primary">上传视频</Button>
					</Upload>

					<Button
						icon={<SaveOutlined />}
						onClick={handleSaveAnnotations}
						disabled={!videoSrc || Object.keys(annotations).length === 0}
						type="primary"
					>
						保存标注
					</Button>

					<Button
						icon={<PlusOutlined />}
						onClick={showAddPersonModal}
						type="primary"
					>
						添加人物
					</Button>

					<Button
						icon={<PlayCircleOutlined />}
						onClick={handleInferenceNextFrame}
						disabled={!videoSrc || isInferencing}
						type="primary"
						loading={isInferencing}
					>
						{isInferencing ? '推理中...' : '推理下一帧'}
					</Button>

					<div className="header-info">
						{videoSrc && (
							<span>当前帧: {currentFrame + 1} / {totalFrames}</span>
						)}
						{selectedPerson && (
							<span className="current-person">
								当前人物:
								<span className="person-name" style={{color: selectedPerson.color}}>
									{selectedPerson.name}
								</span>
							</span>
						)}
					</div>
				</div>
			</Header>

			<Layout className="main-layout">
				<Sider width={250} className="left-sider" theme="light">
					<Tabs defaultActiveKey="persons" className="left-tabs" activeKey={activeTab} onChange={handleTabChange}>
						<TabPane tab="人物" key="persons">
							<PersonManager
								persons={persons}
								selectedPerson={selectedPerson ? selectedPerson.id : null}
								onPersonSelect={handlePersonSelect}
								onAddPerson={handleAddPerson}
								onEditPerson={handleEditPerson}
								onDeletePerson={handleDeletePerson}
								annotations={annotations}
								currentFrame={currentFrame}
							/>
						</TabPane>
						<TabPane tab="关键点" key="keypoints">
							<KeypointList
								selectedKeypoint={selectedKeypoint}
								onKeypointSelect={handleKeypointSelect}
								annotations={annotations}
								currentFrame={currentFrame}
								selectedPerson={selectedPerson ? selectedPerson.id : null}
							/>
						</TabPane>
						<TabPane tab="视频详情" key="videoinfo">
							<VideoInfo
								videoName={videoName}
								videoInfo={videoInfo}
								totalFrames={totalFrames}
								currentFrame={currentFrame}
								annotations={annotations}
								goToFrame={goToFrame}
								persons={persons}
								selectedPerson={selectedPerson}
								simplified={true}
							/>
						</TabPane>
					</Tabs>
					<div className="shortcuts-hint">
						<div><kbd>Tab</kbd> 循环切换标签页</div>
						<div><kbd>Ctrl+N</kbd> 添加新人物</div>
					</div>
				</Sider>

				<Content className="annotation-content">
					<KeypointAnnotator
						frameImage={frameImage}
						videoWidth={videoInfo.width}
						videoHeight={videoInfo.height}
						scale={scale}
						annotations={annotations}
						currentFrame={currentFrame}
						selectedKeypoint={selectedKeypoint}
						selectedPerson={selectedPerson ? selectedPerson.id : null}
						onAnnotate={handleAnnotate}
						onKeypointSelect={handleKeypointSelect}
						persons={persons}
					/>

					{isLoading && (
						<div className="loading-overlay">
							<div className="loading-spinner"></div>
						</div>
					)}
				</Content>
			</Layout>

			<Footer className="annotator-footer">
				{videoSrc && totalFrames > 0 && (
					<FrameSlider
						currentFrame={currentFrame}
						totalFrames={totalFrames}
						onPrevFrame={prevFrame}
						onNextFrame={nextFrame}
						onFrameChange={goToFrame}
						annotations={annotations}
					/>
				)}
			</Footer>

			{/* 添加人物的模态框 */}
			<Modal
				title="添加新人物"
				open={isAddPersonModalVisible}
				onOk={handleAddPersonModalOk}
				onCancel={() => setIsAddPersonModalVisible(false)}
				okText="确定"
				cancelText="取消"
				className="modern-modal"
				destroyOnClose
			>
				<div className="modal-hint">按Enter键快速创建</div>
				<input
					ref={inputRef}
					className="person-name-input"
					placeholder="请输入人物名称"
					value={newPersonName}
					onChange={(e) => setNewPersonName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							handleAddPersonModalOk();
						}
					}}
				/>
			</Modal>
		</Layout>
	);
};

export default VideoAnnotator; 
