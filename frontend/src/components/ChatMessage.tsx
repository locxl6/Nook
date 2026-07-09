import { Button, Tooltip, message as messageApi } from "antd";
import {
	CopyOutlined,
	RedoOutlined,
	DeleteOutlined,
	CheckOutlined,
	RobotOutlined,
	UserOutlined,
} from "@ant-design/icons";
import type { Message } from "@/types";
import { useStreamChat } from "@/hooks/useStreamChat";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
	message: Message;
	isStreaming: boolean;
}

export default function ChatMessageItem({ message, isStreaming }: Props) {
	const { handleRegenerate, handleDeleteMessage } = useStreamChat();
	const [hovered, setHovered] = useState(false);
	const [copied, setCopied] = useState(false);
	const containerRef = useRef<HTMLElement>(null);

	const isUser = message.role === "user";

	const handleMouseEnter = useCallback(() => setHovered(true), []);
	const handleMouseLeave = useCallback(() => setHovered(false), []);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.addEventListener("mouseenter", handleMouseEnter);
		el.addEventListener("mouseleave", handleMouseLeave);
		return () => {
			el.removeEventListener("mouseenter", handleMouseEnter);
			el.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [handleMouseEnter, handleMouseLeave]);

	const doCopy = async () => {
		try {
			await navigator.clipboard.writeText(message.content);
		} catch {
			const ta = document.createElement("textarea");
			ta.value = message.content;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand("copy");
			document.body.removeChild(ta);
		}
		setCopied(true);
		messageApi.success("已复制");
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<section
			ref={containerRef}
			style={{
				display: "flex",
				flexDirection: isUser ? "row-reverse" : "row",
				gap: 12,
				marginBottom: 24,
				padding: "0 4px",
			}}
		>
			<div
				style={{
					width: 32,
					height: 32,
					borderRadius: 10,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: isUser ? "var(--ds-accent)" : "var(--ds-surface)",
					flexShrink: 0,
					marginTop: 2,
				}}
			>
				{isUser ? (
					<UserOutlined style={{ color: "#fff", fontSize: 14 }} />
				) : (
					<RobotOutlined style={{ color: "var(--ds-accent)", fontSize: 14 }} />
				)}
			</div>

			<div style={{ maxWidth: "75%", minWidth: 0 }}>
				<div
					style={{
						fontSize: 11,
						color: "var(--ds-text-tertiary)",
						marginBottom: 4,
						textAlign: isUser ? "right" : "left",
					}}
				>
					{isUser ? "You" : "Nook"}
					{isStreaming && !isUser && (
						<span
							style={{
								display: "inline-block",
								width: 6,
								height: 6,
								borderRadius: "50%",
								background: "var(--ds-accent)",
								marginLeft: 6,
								animation: "pulse 1.2s infinite",
							}}
						/>
					)}
				</div>

				<div
					style={{
						padding: "12px 16px",
						borderRadius: isUser ? "16px 16px 0 16px" : "16px 16px 16px 0",
						background: isUser ? "var(--ds-accent)" : "var(--ds-surface)",
						color: isUser ? "#fff" : "var(--ds-text-primary)",
						fontSize: 14,
						lineHeight: 1.65,
						wordBreak: "break-word",
						border: isUser ? "none" : "1px solid var(--ds-border)",
					}}
				>
					{message.content ? (
						isUser ? (
							<span>{message.content}</span>
						) : (
							<div className="ds-markdown">
								<ReactMarkdown>{message.content}</ReactMarkdown>
							</div>
						)
					) : (
						<span
							style={{ color: "var(--ds-text-tertiary)", fontStyle: "italic" }}
						>
							思考中...
						</span>
					)}
				</div>

				{!isUser && !isStreaming && hovered && message.content && (
					<div style={{ display: "flex", gap: 4, marginTop: 6 }}>
						<Tooltip title="复制">
							<Button
								type="text"
								size="small"
								icon={copied ? <CheckOutlined /> : <CopyOutlined />}
								onClick={doCopy}
								style={{ color: "var(--ds-text-tertiary)", borderRadius: 8 }}
							/>
						</Tooltip>
						<Tooltip title="重新生成">
							<Button
								type="text"
								size="small"
								icon={<RedoOutlined />}
								onClick={handleRegenerate}
								style={{ color: "var(--ds-text-tertiary)", borderRadius: 8 }}
							/>
						</Tooltip>
						<Tooltip title="删除">
							<Button
								type="text"
								size="small"
								icon={<DeleteOutlined />}
								onClick={() => handleDeleteMessage(message.id)}
								style={{ color: "var(--ds-text-tertiary)", borderRadius: 8 }}
							/>
						</Tooltip>
					</div>
				)}
			</div>
		</section>
	);
}
