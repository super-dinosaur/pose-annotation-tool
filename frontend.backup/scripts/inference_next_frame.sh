#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 定义输入输出文件路径
INPUT_FILE="$SCRIPT_DIR/current_frame_annotations.json"
OUTPUT_FILE="$SCRIPT_DIR/../public/next_frame_annotations.json"

# 检查输入文件是否存在
if [ ! -f "$INPUT_FILE" ]; then
    echo "错误: 输入文件 $INPUT_FILE 不存在"
    exit 1
fi

# 运行Python推理脚本
python3 "$SCRIPT_DIR/inference.py" "$INPUT_FILE" "$OUTPUT_FILE"

# 检查输出文件是否生成
if [ ! -f "$OUTPUT_FILE" ]; then
    echo "错误: 输出文件 $OUTPUT_FILE 未生成"
    exit 1
fi

echo "推理完成，结果已保存到 $OUTPUT_FILE" 

# rm -f $SCRIPT_DIR/../public/next_frame_annotations.json
