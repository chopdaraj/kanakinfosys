import React, { useState } from "react";
import { formatINR } from "@/lib/api";
import { ChevronRight, ChevronDown, User } from "lucide-react";

function TreeNode(props) {
  const { node, depth } = props;
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  return React.createElement(
    "div",
    { className: "pl-2", "data-testid": `tree-node-${node.referral_code}` },
    React.createElement(
      "div",
      { className: "flex items-center gap-2 py-2", style: { marginLeft: depth * 16 } },
      hasChildren
        ? React.createElement(
            "button",
            {
              onClick: () => setOpen(!open),
              className: "w-6 h-6 flex items-center justify-center border border-slate-200 hover:bg-slate-100",
              "data-testid": `tree-toggle-${node.referral_code}`,
            },
            open ? React.createElement(ChevronDown, { className: "w-3 h-3" }) : React.createElement(ChevronRight, { className: "w-3 h-3" })
          )
        : React.createElement(
            "span",
            { className: "w-6 h-6 flex items-center justify-center" },
            React.createElement("span", { className: "w-1.5 h-1.5 bg-slate-300 rounded-full" })
          ),
      React.createElement(
        "div",
        { className: "flex items-center gap-3 border border-slate-200 px-3 py-2 flex-1 hover:bg-slate-50" },
        React.createElement(User, { className: "w-4 h-4 text-[#002FA7]" }),
        React.createElement(
          "div",
          { className: "flex-1" },
          React.createElement("div", { className: "font-medium text-sm" }, node.name),
          React.createElement("div", { className: "text-xs text-slate-500" }, node.email)
        ),
        React.createElement(
          "div",
          { className: "text-right" },
          React.createElement("div", { className: "font-mono-num text-sm font-medium" }, formatINR(node.principal)),
          React.createElement("div", { className: "font-mono-num text-xs text-slate-500" }, node.referral_code)
        )
      )
    ),
    hasChildren && open
      ? React.createElement(
          "div",
          { className: "border-l border-slate-200 ml-[19px]" },
          node.children.map((c) => React.createElement(TreeNode, { key: c.id, node: c, depth: depth + 1 }))
        )
      : null
  );
}

export default TreeNode;
