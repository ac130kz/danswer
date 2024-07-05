import { Header } from "@/components/header/Header";
import { AdminSidebar } from "@/components/admin/connectors/AdminSidebar";
import {
  NotebookIcon,
  UsersIcon,
  ThumbsUpIcon,
  BookmarkIcon,
  ZoomInIcon,
  RobotIcon,
  ConnectorIcon,
  GroupsIcon,
  BarChartIcon,
  DatabaseIcon,
  KeyIcon,
  SettingsIcon,
  SlackIcon,
  ShieldIcon,
  CpuIcon,
  ToolIcon,
  PackageIcon,
  PaintingIcon,
  ChatIcon,
  SearchIcon,
} from "@/components/icons/icons";
import { User } from "@/lib/types";
import {
  AuthTypeMetadata,
  getAuthTypeMetadataSS,
  getCurrentUserSS,
} from "@/lib/userSS";
import { SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED } from "@/lib/constants";
import { redirect } from "next/navigation";
import {
  FiActivity,
  FiBarChart2,
  FiCpu,
  FiImage,
  FiPackage,
  FiSettings,
  FiShield,
  FiSlack,
  FiTool,
} from "react-icons/fi";
import { UserDropdown } from "../UserDropdown";

export async function Layout({ children }: { children: React.ReactNode }) {
  const tasks = [getAuthTypeMetadataSS(), getCurrentUserSS()];

  // catch cases where the backend is completely unreachable here
  // without try / catch, will just raise an exception and the page
  // will not render
  let results: (User | AuthTypeMetadata | null)[] = [null, null];
  try {
    results = await Promise.all(tasks);
  } catch (e) {
    console.log(`Some fetch failed for the main search page - ${e}`);
  }

  const authTypeMetadata = results[0] as AuthTypeMetadata | null;
  const user = results[1] as User | null;

  const authDisabled = authTypeMetadata?.authType === "disabled";
  const requiresVerification = authTypeMetadata?.requiresVerification;
  if (!authDisabled) {
    if (!user) {
      return redirect("/auth/login");
    }
    if (user.role !== "admin") {
      return redirect("/");
    }
    if (!user.is_verified && requiresVerification) {
      return redirect("/auth/waiting-on-verification");
    }
  }

  return (
    <div className="h-screen overflow-y-hidden">
      <div className="flex h-full ">
        <div className="w-80 z-[100] bg-background-weak pt-4 pb-8 h-full border-r border-border  weakbackground overflow-auto">
          <AdminSidebar
            collections={[
              {
                name: "Connectors",
                items: [
                  {
                    name: (
                      <div className="flex">
                        <NotebookIcon size={18} />
                        <div className="ml-1">Existing Connectors</div>
                      </div>
                    ),
                    link: "/admin/indexing/status",
                  },
                  {
                    name: (
                      <div className="flex">
                        <ConnectorIcon size={18} />
                        <div className="ml-1.5">Add Connector</div>
                      </div>
                    ),
                    link: "/admin/add-connector",
                  },
                ],
              },
              {
                name: "Document Management",
                items: [
                  {
                    name: (
                      <div className="flex">
                        <BookmarkIcon size={18} />
                        <div className="ml-1">Document Sets</div>
                      </div>
                    ),
                    link: "/admin/documents/sets",
                  },
                  {
                    name: (
                      <div className="flex">
                        <ZoomInIcon size={18} />
                        <div className="ml-1">Explorer</div>
                      </div>
                    ),
                    link: "/admin/documents/explorer",
                  },
                  {
                    name: (
                      <div className="flex">
                        <ThumbsUpIcon size={18} />
                        <div className="ml-1">Feedback</div>
                      </div>
                    ),
                    link: "/admin/documents/feedback",
                  },
                ],
              },
              {
                name: "Custom Assistants",
                items: [
                  {
                    name: (
                      <div className="flex">
                        <RobotIcon className="my-auto" size={18} />
                        <div className="ml-1">Assistants</div>
                      </div>
                    ),
                    link: "/admin/assistants",
                  },
                  {
                    name: (
                      <div className="flex">
                        {/* <FiSlack size={18} /> */}
                        <SlackIcon />
                        <div className="ml-1">Slack Bots</div>
                      </div>
                    ),
                    link: "/admin/bot",
                  },
                  {
                    name: (
                      <div className="flex">
                        {/* <FiTool size={18} className="my-auto" /> */}
                        <ToolIcon size={18} />
                        <div className="ml-1">Tools</div>
                      </div>
                    ),
                    link: "/admin/tools",
                  },
                ],
              },
              {
                name: "Model Configs",
                items: [
                  {
                    name: (
                      <div className="flex">
                        {/* <FiCpu size={18} /> */}
                        <CpuIcon size={18} />
                        <div className="ml-1">LLM</div>
                      </div>
                    ),
                    link: "/admin/models/llm",
                  },
                  {
                    name: (
                      <div className="flex">
                        {/* <FiPackage size={18} /> */}
                        <PackageIcon />

                        <div className="ml-1">Embedding</div>
                      </div>
                    ),
                    link: "/admin/models/embedding",
                  },
                ],
              },
              {
                name: "User Management",
                items: [
                  {
                    name: (
                      <div className="flex">
                        <UsersIcon size={18} />
                        <div className="ml-1">Users</div>
                      </div>
                    ),
                    link: "/admin/users",
                  },
                  ...(SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED
                    ? [
                        {
                          name: (
                            <div className="flex">
                              <GroupsIcon size={18} />
                              <div className="ml-1">Groups</div>
                            </div>
                          ),
                          link: "/admin/groups",
                        },
                        {
                          name: (
                            <div className="flex">
                              <KeyIcon size={18} />
                              <div className="ml-1">API Keys</div>
                            </div>
                          ),
                          link: "/admin/api-key",
                        },
                      ]
                    : []),
                  {
                    name: (
                      <div className="flex">
                        {/* <FiShield size={18} /> */}
                        <ShieldIcon size={18} />
                        <div className="ml-1">Token Rate Limits</div>
                      </div>
                    ),
                    link: "/admin/token-rate-limits",
                  },
                ],
              },
              ...(SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED
                ? [
                    {
                      name: "Performance",
                      items: [
                        {
                          name: (
                            <div className="flex">
                              <FiActivity size={18} />
                              <div className="ml-1">Usage Statistics</div>
                            </div>
                          ),
                          link: "/admin/performance/usage",
                        },
                        {
                          name: (
                            <div className="flex">
                              <DatabaseIcon size={18} />
                              <div className="ml-1">Query History</div>
                            </div>
                          ),
                          link: "/admin/performance/query-history",
                        },
                        {
                          name: (
                            <div className="flex">
                              <FiBarChart2 size={18} />
                              <div className="ml-1">Custom Analytics</div>
                            </div>
                          ),
                          link: "/admin/performance/custom-analytics",
                        },
                      ],
                    },
                  ]
                : []),
              {
                name: "Settings",
                items: [
                  {
                    name: (
                      <div className="flex">
                        <SettingsIcon size={18} />
                        <div className="ml-1">Workspace Settings</div>
                      </div>
                    ),
                    link: "/admin/settings",
                  },
                  ...(SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED
                    ? [
                        {
                          name: (
                            <div className="flex">
                              <PaintingIcon size={18} />
                              <div className="ml-1">Whitelabeling</div>
                            </div>
                          ),
                          link: "/admin/whitelabeling",
                        },
                      ]
                    : []),
                ],
              },
            ]}
          />
        </div>
        <div className="pb-8 relative h-full overflow-y-auto w-full">
          <div className="fixed bg-background left-0 border-b  gap-x-4 mb-8 px-4 py-4 w-full items-center flex justify-end">
            <a
              href="/chat"
              className="transition-all duration-150 cursor-pointer p-1 text-sm items-center flex gap-x-1 px-2 py-1 rounded-lg hover:shadow-sm hover:ring-1 hover:ring-[#E85801]/40 hover:bg-opacity-90 text-[#E85801] bg-[#FAEBE5]"
            >
              <ChatIcon className="!h-3 !w-3" />
              Chat
            </a>
            <a
              href="/search"
              className="transition-all duration-150 cursor-pointer p-1 text-sm items-center flex gap-x-1 px-2 py-1 rounded-lg hover:shadow-xs text-[#0191E8] hover:ring-1 hover:ring-[#0191E8]/40 hover:bg-opacity-90  bg-[#E5F4FA]"
            >
              <SearchIcon className="!h-3 !w-3" />
              Search
            </a>
            <UserDropdown user={user} />
          </div>
          <div className="pt-20 flex overflow-y-auto h-full px-4 md:px-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
